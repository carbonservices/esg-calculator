const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('inline application scripts compile', () => {
    const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter(match => !/\bsrc=/.test(match[1]) && !/application\/ld\+json/.test(match[1]))
        .map(match => match[2])
        .filter(source => source.trim());
    assert.ok(scripts.length > 0);
    scripts.forEach(source => assert.doesNotThrow(() => new vm.Script(source)));
});

test('static HTML ids are unique', () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]).filter(id => !id.includes('${'));
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    assert.deepEqual(duplicates, []);
});

test('local browser scripts resolve from the application root', () => {
    const sources = [...html.matchAll(/<script[^>]+src="([^"]+)"/gi)]
        .map(match => match[1])
        .filter(source => !/^https?:\/\//.test(source));
    assert.ok(sources.length > 0);
    sources.forEach(source => assert.equal(fs.existsSync(path.join(__dirname, '..', source)), true, source));
});

test('analytics labels every event with the active framework', () => {
    assert.match(html, /'framework': framework/);
    assert.match(html, /project && project\.framework === 'gri' \? 'gri' : 'brsr'/);
});

test('GRI workflow actions have dedicated analytics events', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'gri.js'), 'utf8');
    [
        'gri_profile_updated',
        'gri_evidence_factor_toggled',
        'gri_metric_category_selected',
        'gri_metric_group_toggled',
        'gri_metric_updated',
        'gri_weight_updated',
        'gri_standard_toggled',
        'gri_topic_updated',
        'gri_topic_added',
        'gri_topic_removed',
        'gri_recommendation_updated',
        'gri_disclosure_updated',
        'gri_disclosure_filter_updated',
        'download_gri_index',
        'download_gri_dashboard',
        'download_project_json',
        'import_project_json',
        'workspace_validation'
    ].forEach(action => assert.match(source, new RegExp(`['"]${action}['"]`)));
});
