import socket, json, time, select
from pathlib import Path

HOST='localhost'; PORT=9877; TIMEOUT=2400
code = Path('/home/openclaw-agent/.openclaw/workspace/.crew/blender-research/agot_v16_payload.py').read_text()
cmd = json.dumps({'type':'execute_code','params':{'code':code}})

sock=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
sock.connect((HOST,PORT))
sock.sendall(cmd.encode('utf-8'))

data=b''
start=time.time()
while time.time()-start < TIMEOUT:
    r,_,_=select.select([sock],[],[],2.0)
    if not r:
        continue
    chunk=sock.recv(16384)
    if not chunk:
        break
    data += chunk
    try:
        parsed=json.loads(data.decode())
        print(json.dumps(parsed, indent=2))
        break
    except Exception:
        pass
else:
    print(json.dumps({'status':'error','message':'timeout waiting for blender response'}, indent=2))
sock.close()
