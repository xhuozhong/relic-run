// Static release validation; no browser, build tooling or network required.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const references = new Set([
  ...Array.from(html.matchAll(/(?:src|href)="([^"#]+)"/g), m => m[1]).filter(s => !s.startsWith('data:')),
  ...Array.from(game.matchAll(/['"](assets\/[^'"+]+\.(?:png|jpg|hdr|glb))['"]/g), m => m[1]),
  ...['temple-gate', 'serpent-pair', 'road-module'].map(n => 'assets/' + n + '.json'),
]);
for (const file of references) {
  if (!fs.existsSync(path.join(root, file))) throw Error('Missing runtime file: ' + file);
}
for (const file of fs.readdirSync(root).filter(n => /\.(?:js|cjs)$/.test(n))) {
  new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}
const glb = fs.readFileSync(path.join(root, 'assets/runner.glb'));
if (glb.toString('ascii', 0, 4) !== 'glTF') throw Error('Invalid GLB header');
const gltf = JSON.parse(glb.toString('utf8', 20, 20 + glb.readUInt32LE(12)).trim());
for (const resource of [...(gltf.images || []), ...(gltf.buffers || [])]) {
  if (resource.uri && !resource.uri.startsWith('data:')) throw Error('Unexpected external GLB resource');
}
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.git' || entry.name === 'FILE_MANIFEST.json') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    const bytes = fs.readFileSync(full);
    const relative = path.relative(root, full).split(path.sep).join('/');
    const text = bytes.toString('utf8');
    if (/[A-Za-z]:[\\/](?:Users|Documents|Program Files)[\\/]/.test(text)) {
      throw Error('Local machine path found in ' + relative);
    }
    if (/(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_]{20,}/.test(text)) {
      throw Error('Credential-like text found in ' + relative);
    }
    files.push({ path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  }
}
walk(root);
const manifest = {
  schemaVersion: 1,
  release: 'Relic Run revision 5 static web distribution',
  excludes: ['FILE_MANIFEST.json (this manifest)', '.git/'],
  fileCount: files.length,
  totalBytes: files.reduce((n, f) => n + f.bytes, 0),
  runtimeReferences: Array.from(references).sort(),
  files,
};
if (process.argv.includes('--manifest')) {
  fs.writeFileSync(path.join(root, 'FILE_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify({ passed: true, files: files.length, runtimeReferences: references.size, totalBytes: manifest.totalBytes, MiB: Number((manifest.totalBytes / 1048576).toFixed(2)), externalGlbResources: 0, animationClips: (gltf.animations || []).map(a => a.name) }, null, 2));
