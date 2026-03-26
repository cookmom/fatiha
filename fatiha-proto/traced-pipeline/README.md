# Traced Pipeline — SAM 3 Automated Architectural Extraction

## Setup (Run on Tawfeeq's WSL2 machine with A6000s)

### 1. Install SAM 3
```bash
conda create -n traced python=3.12
conda activate traced
pip install torch==2.7.0 torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
git clone https://github.com/facebookresearch/sam3.git /var/lib/cookmom-workspace/sam3
cd /var/lib/cookmom-workspace/sam3
pip install -e ".[notebooks]"
```

### 2. Get Model Access
1. Go to https://huggingface.co/facebook/sam3
2. Request access (usually approved within hours)
3. Run: `huggingface-cli login` (paste your HF token)

### 3. Run the Pipeline
```bash
cd /path/to/fatiha-proto/traced-pipeline
python extract.py --image ../szm-reference.jpg --output szm-extraction.json
python generate.py --extraction szm-extraction.json --output ../szm-v2.html
```

## Pipeline Stages

### extract.py — SAM 3 Architectural Element Extraction
- Loads reference image
- Prompts SAM 3 with architectural vocabulary: "dome", "arch", "column", "minaret", "portal", "window", "crescent", "floor", "wall"
- For each detected element: mask, bounding box, confidence score
- Fits geometric primitives to mask contours (circles for domes, arcs for arches, rectangles for walls)
- Computes proportional ratios between all element pairs
- Tests ratios against canonical constants (φ, √2, √3, etc.)
- Outputs JSON with full proportional skeleton

### generate.py — p5.brush Drawing Code Generator
- Reads extraction JSON
- Converts proportional skeleton to p5.brush STEPS array
- Generates complete HTML file following dome.html template
- Includes HUD, annotations, watercolor washes
