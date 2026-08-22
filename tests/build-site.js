const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(output, 'index.html'));
fs.cpSync(path.join(root, 'js'), path.join(output, 'js'), { recursive: true });
fs.copyFileSync(path.join(root, 'logo.png'), path.join(output, 'logo.png'));
fs.copyFileSync(path.join(root, 'logo-lg.png'), path.join(output, 'logo-lg.png'));
