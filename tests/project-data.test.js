const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const projectData = require('../js/project-data.js');
const griData = require('../js/gri-data.js');
const griMetrics = require('../js/gri-metrics.js');

const root = path.join(__dirname, '..');
const factors = {
    elec: { value: 0.72, scale: 1, unit: 'MWh', citation: 'Verified source' },
    custom: { value: 1, scale: 1, unit: 'units', citation: 'User source' }
};
const ambitionMetrics = ['ghg', 'water', 'energy', 'safety', 'griGrossEmissions', 'griNetEnergy', 'griWaterConsumption', 'griWasteDiversion', 'griEmployeeInjuryRate', 'griLocalProcurement'];
const metricFields = griMetrics.categories.flatMap(category => category.groups.flatMap(group => group.fields));
const options = {
    ghgFactors: factors,
    ambitionMetrics,
    griStandardIds: griData.standards.map(standard => standard.id),
    griDisclosureKeys: griData.disclosures.map(disclosure => disclosure.key),
    griNumericFields: metricFields.filter(field => field[3] !== 'text' && field[3] !== 'select').map(field => field[0]),
    griTextFields: metricFields.filter(field => field[3] === 'text').map(field => field[0])
};

function fixture(name) {
    return JSON.parse(fs.readFileSync(path.join(root, 'case-studies', name), 'utf8'));
}

test('case studies pass project schema validation', () => {
    const gri = projectData.validatePayload(fixture('HINDALCO_2024-25_GRI_PROJECT.json'), options);
    const brsr = projectData.validatePayload(fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json'), options);
    assert.equal(gri.framework, 'gri');
    assert.equal(brsr.framework, 'brsr');
});

test('project schema requires the current schema version', () => {
    const payload = fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json');
    payload.schemaVersion = 1;
    assert.throws(() => projectData.validatePayload(payload, options), /schema version 2/);
});

test('project schema rejects unsupported GHG sources', () => {
    const payload = fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json');
    payload.project.years['2026'].ghgRows[0].source = 'unknown';
    assert.throws(() => projectData.validatePayload(payload, options), /unsupported factor type/);
});

test('project schema persists factor scale and unit defaults', () => {
    const payload = fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json');
    const project = projectData.validatePayload(payload, options);
    assert.equal(project.years['2026'].ghgRows[0].scale, '1');
    assert.equal(project.years['2026'].ghgRows[0].unit, 'units');
});

test('project schema rejects executable custom topic identifiers', () => {
    const payload = fixture('HINDALCO_2024-25_GRI_PROJECT.json');
    payload.project.years['2025'].gri.customTopics[0].id = "x');alert(1);//";
    assert.throws(() => projectData.validatePayload(payload, options), /invalid identifier/);
});

test('project schema rejects invalid ambition records', () => {
    const payload = fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json');
    payload.project.ambitions = [{ id: 'bad()', metric: 'ghg', year: '<img>', target: -1 }];
    assert.throws(() => projectData.validatePayload(payload, options), /invalid identifier/);
});
