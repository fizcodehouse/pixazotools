// Deploy dist/ to Vercel via REST API
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const PROJECT_ID = 'prj_wlLYJbq4cGtAHyhkKoFkq93NSQdC';
const TEAM_ID = 'team_qt52cF4IUHh7awf9EEkNpLXm';
const TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN || '';
const API = 'https://api.vercel.com';

if (!TOKEN) {
  console.error('❌ VERCEL_TOKEN env var not set');
  console.error('   Set it and re-run: VERCEL_TOKEN=xxx node deploy-vercel.cjs');
  process.exit(1);
}

function api(method, pathname, body) {
  const url = new URL(API + pathname);
  const isFileUpload = body instanceof Buffer;
  const options = {
    method,
    hostname: url.hostname,
    path: url.pathname + url.search,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  };
  if (body && !isFileUpload) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }
  if (isFileUpload) {
    options.headers['Content-Type'] = 'application/octet-stream';
    options.headers['Content-Length'] = body.length;
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${method} ${pathname} -> ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch {
          if (res.statusCode >= 400) {
            reject(new Error(`${method} ${pathname} -> ${res.statusCode}: ${data.slice(0, 500)}`));
          } else {
            resolve({ raw: data });
          }
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Walk dist/
  const distDir = path.join(__dirname, 'dist');
  const files = [];
  function walk(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(full, rel);
      else files.push({ file: rel, data: fs.readFileSync(full), sha: crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex') });
    }
  }
  walk(distDir, '');
  const totalKB = files.reduce((a, f) => a + f.data.length, 0) / 1024;
  console.log(`Found ${files.length} files in dist/, total size: ${totalKB.toFixed(1)} KB`);

  // Upload files
  for (const f of files) {
    try {
      await api('PUT', `/v13/files/${f.sha}?teamId=${TEAM_ID}`, f.data);
      console.log(`  ✓ ${f.file} (${(f.data.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`  ✗ ${f.file}: ${e.message}`);
    }
  }

  // Create deployment
  const deployment = {
    name: 'pixazotools',
    project: 'pixazotools',
    files: files.map(f => ({ file: f.file, sha: f.sha })),
    projectSettings: {
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
    },
  };

  console.log('\nCreating deployment...');
  const result = await api('POST', `/v13/deployments?teamId=${TEAM_ID}`, JSON.stringify(deployment));
  console.log(`\n✅ Deployment created!`);
  console.log(`   URL: ${result.url}`);
  console.log(`   Alias: ${result.alias?.[0] || 'pending…'}`);
  console.log(`   State: ${result.readyState}`);
  if (result.id) console.log(`   ID: ${result.id}`);
}

main().catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
