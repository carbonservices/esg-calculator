const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function filesBelow(directory, prefix = '') {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const relative = path.join(prefix, entry.name);
        return entry.isDirectory() ? filesBelow(path.join(directory, entry.name), relative) : [relative.replaceAll('\\', '/')];
    });
}

test('Netlify output contains only browser application assets', () => {
    require('./build-site.js');
    assert.deepEqual(filesBelow(path.join(root, 'dist')).sort(), [
        'index.html',
        'js/calculations.js',
        'js/gri-data.js',
        'js/gri-metrics.js',
        'js/gri-scoring.js',
        'js/gri.js',
        'js/pdf-export.js',
        'js/project-data.js',
        'logo-lg.png',
        'logo.png'
    ]);
});
