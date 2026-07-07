#!/usr/bin/env python3
"""Deploy pixazotools dist/ to Vercel via OneCLI proxy using inline files."""
import json
import os
import base64
import subprocess
import tempfile
from pathlib import Path

DIST = Path('/workspace/pixazotools/dist')
TEAM_ID = 'team_qt52cF4IUHh7awf9EEkNpLXm'

# Build the files list with base64-encoded data
files = []
for f in sorted(DIST.rglob('*')):
    if f.is_file():
        rel = str(f.relative_to(DIST))
        content = f.read_bytes()
        b64 = base64.b64encode(content).decode()
        files.append({'file': rel, 'data': b64, 'encoding': 'base64'})

total_kb = sum(len(base64.b64decode(f['data'])) for f in files) / 1024
print(f'Found {len(files)} files ({total_kb:.1f} KB)')

# Build deployment payload
deployment = {
    'name': 'pixazotools',
    'files': files,
    'projectSettings': {
        'framework': 'vite',
        'outputDirectory': 'dist',
    },
}

# Write to temp file for curl
with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
    json.dump(deployment, f)
    tmp_path = f.name

print('Creating deployment with inline files...')

# Use curl through OneCLI proxy
url = f'https://api.vercel.com/v13/deployments?teamId={TEAM_ID}'
cmd = [
    'curl', '-s', '-X', 'POST', url,
    '-H', 'Content-Type: application/json',
    '-d', f'@{tmp_path}',
    '--max-time', '30',
]

result = subprocess.run(cmd, capture_output=True, text=True)
os.unlink(tmp_path)

if result.returncode != 0:
    print(f'curl error: {result.stderr}')
    exit(1)

data = json.loads(result.stdout)
if 'error' in data:
    print(f'API error: {json.dumps(data["error"], indent=2)}')
    exit(1)

print(f'\n✅ Deployment created!')
print(f'   Preview URL: https://{data.get("url", "?")}')
print(f'   ID: {data.get("id", "?")}')
print(f'   State: {data.get("readyState", "?")}')
if data.get('alias'):
    print(f'   Aliases: {", ".join(data["alias"])}')
