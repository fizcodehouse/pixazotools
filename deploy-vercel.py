#!/usr/bin/env python3
"""Deploy pixazotools dist/ to Vercel via OneCLI proxy."""
import hashlib
import json
import os
import base64
import urllib.request
import ssl
from pathlib import Path

DIST = Path(__file__).parent / 'dist'
TEAM_ID = 'team_qt52cF4IUHh7awf9EEkNpLXm'
PROJECT_ID = 'prj_wlLYJbq4cGtAHyhkKoFkq93NSQdC'
API = 'https://api.vercel.com'

# OneCLI proxy config from env
proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or ''
ca_bundle = os.environ.get('NODE_EXTRA_CA_CERTS') or ''

def build_opener():
    handlers = []
    if proxy:
        # urllib handles HTTP_PROXY/HTTPS_PROXY automatically
        pass
    ctx = ssl.create_default_context()
    if ca_bundle:
        ctx.load_verify_locations(ca_bundle)
    else:
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    return urllib.request.build_opener(
        urllib.request.HTTPSHandler(context=ctx)
    )

opener = build_opener()

def api(method, path, body=None, content_type='application/json'):
    url = f'{API}{path}'
    data = None
    if body is not None:
        data = json.dumps(body).encode() if isinstance(body, dict) else body
    req = urllib.request.Request(url, data=data, method=method)
    if content_type:
        req.add_header('Content-Type', content_type)
    try:
        with opener.open(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        raise RuntimeError(f'{method} {path} -> {e.code}: {err_body[:500]}')

# Walk dist/ directory
files = []
for f in sorted(DIST.rglob('*')):
    if f.is_file():
        rel = str(f.relative_to(DIST))
        content = f.read_bytes()
        b64 = base64.b64encode(content).decode()
        sha1 = hashlib.sha1(content).hexdigest()
        files.append({'file': rel, 'data': b64, 'sha': sha1, 'size': len(content)})

total_kb = sum(f['size'] for f in files) / 1024
print(f'Found {len(files)} files ({total_kb:.1f} KB)')

# Upload each file to Vercel files API
for f in files:
    try:
        # PUT /v13/files/{sha} with raw binary content
        raw = base64.b64decode(f['data'])
        result = api('PUT', f'/v13/files/{f["sha"]}?teamId={TEAM_ID}', raw, 'application/octet-stream')
        print(f'  \u2713 {f["file"]} ({f["size"]/1024:.1f} KB)')
    except RuntimeError as e:
        print(f'  \u2717 {f["file"]}: {e}')

# Create deployment referencing uploaded files
deployment = {
    'name': 'pixazotools',
    'project': 'pixazotools',
    'files': [{'file': f['file'], 'sha': f['sha']} for f in files],
    'projectSettings': {
        'framework': 'vite',
        'buildCommand': 'npm run build',
        'outputDirectory': 'dist',
        'installCommand': 'npm install',
    },
}

print('\nCreating deployment...')
result = api('POST', f'/v13/deployments?teamId={TEAM_ID}', deployment)
print(f'\n\u2705 Deployment created!')
print(f'   URL (preview): {result.get("url", "?")}')
print(f'   ID: {result.get("id", "?")}')
print(f'   State: {result.get("readyState", "?")}')
if result.get('alias'):
    print(f'   Alias: {", ".join(result["alias"])}')
