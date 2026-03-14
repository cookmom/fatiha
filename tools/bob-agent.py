#!/usr/bin/env python3
"""
Bob — Builder Agent powered by Qwen 3.5 (local) + Blender MCP.

Reads a tutorial brief, executes steps in Blender, learns techniques.
Runs entirely on local GPU — zero API cost.

Usage:
    python3 bob-agent.py <brief-file> [--dry-run]
"""

import json
import sys
import os
import time
import subprocess
import re

# Local imports
sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3.5:35b-a3b"
BRIDGE = os.path.join(os.path.dirname(__file__), "blender-bridge.py")

# Conversation history for multi-turn
_history = []


def ollama_generate(prompt, system=None, max_tokens=2000, temperature=0.3):
    """Call Qwen 3.5 via Ollama."""
    import urllib.request

    body = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": temperature
        }
    }
    if system:
        body["system"] = system

    data = json.dumps(body).encode()
    req = urllib.request.Request(
        OLLAMA_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    resp = urllib.request.urlopen(req, timeout=120)
    result = json.loads(resp.read().decode())
    return result.get("response", "")


def blender_cmd(action, *args):
    """Run a blender-bridge command and return parsed result."""
    cmd = ["python3", BRIDGE, action] + list(args)
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        return {"status": "error", "message": proc.stderr}
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        return {"status": "error", "message": proc.stdout}


def execute_in_blender(code):
    """Execute Python code in Blender via bridge."""
    result = blender_cmd("exec", code)
    return result


def get_scene():
    """Get current Blender scene info."""
    return blender_cmd("scene")


SYSTEM_PROMPT = """You are Bob, a 3D modeler and Blender expert. You learn by doing.

You are working through a tutorial step-by-step in Blender 5.0. Your goal is not just to complete the tutorial, but to INTERNALIZE the techniques so you can apply them to any future brief.

You have ONE tool: execute Python code in Blender via bpy.

When given a tutorial step, respond with EXACTLY this format:

THINKING: <what this step teaches and why it matters>
CODE:
```python
<bpy python code to execute>
```
LEARNED: <technique/principle to remember for future work>

Rules:
- Write complete, self-contained bpy code for each step
- Use print() to output verification (e.g., print object names, vertex counts)
- If a step is conceptual (navigation, UI), note the technique but skip CODE
- After each step, verify the result by querying the scene
- Keep code clean and commented
"""


def run_tutorial(brief_path, dry_run=False):
    """Run Bob through a tutorial brief."""
    with open(brief_path, 'r') as f:
        brief = f.read()

    print(f"{'='*60}")
    print(f"BOB — Builder Agent")
    print(f"Model: {MODEL} (local)")
    print(f"Brief: {brief_path}")
    print(f"Dry run: {dry_run}")
    print(f"{'='*60}\n")

    # Get initial scene state
    if not dry_run:
        scene = get_scene()
        print(f"Scene: {json.dumps(scene, indent=2)[:500]}\n")

    # Ask Qwen to break the tutorial into executable steps
    plan_prompt = f"""Here is a Blender tutorial transcript. Break it into numbered executable steps.
For each step, identify:
1. What to do (specific bpy commands)
2. What technique it teaches
3. Expected result

Only include steps that involve DOING something in Blender (skip navigation/UI explanations).

TUTORIAL:
{brief[:8000]}

Output a numbered list of steps. Be specific about values (sizes, vertex counts, etc)."""

    print("Planning steps...\n")
    plan = ollama_generate(plan_prompt, system=SYSTEM_PROMPT, max_tokens=3000)
    print(f"PLAN:\n{plan}\n")
    print(f"{'='*60}\n")

    # Now execute each step
    # Extract steps separated by --- or numbered or THINKING: blocks
    steps = re.split(r'\n---+\n|\n(?=THINKING:)', plan.strip())
    steps = [s.strip() for s in steps if s.strip() and ('CODE' in s or 'python' in s)]
    if not steps:
        # Fallback: split by numbered items
        steps = re.split(r'\n(?=\d+[\.\)])', plan.strip())
        steps = [s.strip() for s in steps if s.strip() and re.match(r'\d+[\.\)]', s)]

    skills_learned = []

    for i, step in enumerate(steps):
        print(f"\n{'─'*60}")
        print(f"STEP {i+1}/{len(steps)}")
        print(f"{'─'*60}")
        print(f"{step}\n")

        # Ask Qwen to generate code for this step
        if not dry_run:
            scene_state = json.dumps(get_scene(), indent=2)[:800]
        else:
            scene_state = "(dry run)"

        exec_prompt = f"""Current Blender scene state:
{scene_state}

Execute this tutorial step:
{step}

Remember the format: THINKING, CODE block, LEARNED."""

        response = ollama_generate(exec_prompt, system=SYSTEM_PROMPT, max_tokens=1500)
        print(response)

        # Extract and execute code
        code_match = re.search(r'```python\n(.*?)```', response, re.DOTALL)
        if code_match and not dry_run:
            code = code_match.group(1).strip()
            print(f"\n>> Executing in Blender...")
            result = execute_in_blender(code)
            status = result.get("status", "unknown")
            output = result.get("result", {})
            if isinstance(output, dict):
                output = output.get("result", str(output))
            print(f">> Result ({status}): {str(output)[:500]}")

            if status == "error":
                # Let Qwen fix it
                fix_prompt = f"""The code failed with error:
{result.get('message', output)}

Original step: {step}
Original code:
```python
{code}
```

Fix the code. Same format: CODE block only."""

                fix_response = ollama_generate(fix_prompt, system=SYSTEM_PROMPT, max_tokens=1000)
                print(f"\n>> Fix attempt:\n{fix_response}")

                fix_match = re.search(r'```python\n(.*?)```', fix_response, re.DOTALL)
                if fix_match:
                    fixed_code = fix_match.group(1).strip()
                    print(f"\n>> Retrying...")
                    retry = execute_in_blender(fixed_code)
                    print(f">> Retry ({retry.get('status')}): {str(retry.get('result', ''))[:500]}")

        # Extract learned skill
        learned_match = re.search(r'LEARNED:\s*(.+?)(?:\n\n|\Z)', response, re.DOTALL)
        if learned_match:
            skills_learned.append(learned_match.group(1).strip())

        # Small pause between steps
        time.sleep(0.5)

    # Summary
    print(f"\n{'='*60}")
    print("SKILLS ACQUIRED")
    print(f"{'='*60}")
    for i, skill in enumerate(skills_learned, 1):
        print(f"  {i}. {skill}")

    # Save skills to file
    skills_file = brief_path.replace('.md', '-skills.md')
    with open(skills_file, 'w') as f:
        f.write("# Skills Learned\n\n")
        f.write(f"Tutorial: {brief_path}\n")
        f.write(f"Date: {time.strftime('%Y-%m-%d %H:%M')}\n\n")
        for i, skill in enumerate(skills_learned, 1):
            f.write(f"{i}. {skill}\n")
    print(f"\nSkills saved to: {skills_file}")

    return skills_learned


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: bob-agent.py <brief-file> [--dry-run]")
        sys.exit(1)

    brief_path = sys.argv[1]
    dry_run = "--dry-run" in sys.argv

    if not os.path.exists(brief_path):
        print(f"Brief not found: {brief_path}")
        sys.exit(1)

    run_tutorial(brief_path, dry_run=dry_run)
