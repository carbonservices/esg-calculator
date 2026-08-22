const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const calc = require('../js/calculations.js');
const griData = require('../js/gri-data.js');

const root = path.join(__dirname, '..');

function fixture(name) {
    return JSON.parse(fs.readFileSync(path.join(root, 'case-studies', name), 'utf8'));
}

function assertImportEnvelope(payload, framework, year) {
    assert.equal(payload.schemaVersion, 2);
    assert.equal(payload.project.framework, framework);
    assert.equal(payload.project.currentFY, year);
    assert.ok(payload.project.years[year]);
    const data = payload.project.years[year];
    assert.ok(data.inputs && typeof data.inputs === 'object');
    assert.ok(Array.isArray(data.ghgRows));
    assert.ok(Array.isArray(data.waterIn));
    assert.ok(Array.isArray(data.waterOut));
    assert.ok(data.metrics && typeof data.metrics === 'object');
}

test('case-study JSON files satisfy the calculator import envelope', () => {
    assertImportEnvelope(fixture('HINDALCO_2024-25_GRI_PROJECT.json'), 'gri', '2025');
    assertImportEnvelope(fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json'), 'brsr', '2026');
});

test('Hindalco fixture reproduces the documented 58.2358 readiness result', () => {
    const state = fixture('HINDALCO_2024-25_GRI_PROJECT.json').project.years['2025'].gri;
    const selectedStandards = new Set(griData.standards.filter(standard => state.selectedStandards[standard.id]).map(standard => standard.title));
    const disclosureRows = griData.disclosures
        .filter(disclosure => selectedStandards.has(disclosure.standard) && state.disclosures[disclosure.key]?.applicability === 'applicable')
        .map(disclosure => {
            const record = state.disclosures[disclosure.key];
            return {
                completeness: record.completeness,
                quality: record.quality,
                evidenceRelevance: record.evidenceRelevance,
                weight: disclosure.group === 'Universal' ? state.weights.universal : state.weights[record.materiality]
            };
        });
    const topicRows = state.customTopics.filter(topic => topic.title.trim()).map(topic => ({
        completeness: topic.completeness,
        quality: topic.quality,
        evidenceRelevance: topic.evidenceRelevance,
        weight: state.weights[topic.priority]
    }));
    const rows = disclosureRows.concat(topicRows);
    assert.equal(rows.length, 141);
    assert.ok(Math.abs(calc.weightedReadiness(rows, false) - 58.23580596040906) < 1e-12);
});

test('Tata Steel fixture reproduces report-derived BRSR metrics', () => {
    const data = fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json').project.years['2026'];
    const input = data.inputs;
    const ghg = calc.ghgTotal(data.ghgRows.map(row => ({ factor: row.factor, activity: row.activity, scale: 1 })));
    const withdrawal = calc.sum(data.waterIn.map(row => row.amount), 'Water withdrawal');
    const discharge = calc.sum(data.waterOut.map(row => row.amount), 'Water discharge');
    const water = calc.waterBalance(withdrawal.value, discharge.value);
    const energy = calc.sum([input.nrg_ren, input.nrg_non], 'Energy');

    assert.equal(ghg.total, 69000000);
    assert.equal(water.value, 99055000);
    assert.equal(energy.value, 623810000);
    assert.ok(Math.abs(calc.intensity(ghg.total, input.g_revenue, 'GHG intensity').value - 0.00004938440549263378) < 1e-18);
    assert.ok(Math.abs(calc.intensity(water.value, input.g_revenue, 'Water intensity').value - 0.00007089525052279477) < 1e-18);
    assert.ok(Math.abs(calc.intensity(energy.value, input.g_revenue, 'Energy intensity').value - 0.000446470811454491) < 1e-18);
    assert.ok(Math.abs(calc.intensity(input.wst_gen, input.g_revenue, 'Waste intensity').value - 0.000013442756531588627) < 1e-18);
    assert.ok(Math.abs(calc.percentage(input.nrg_ren, energy.value, 'Renewable').value - 0.24206088392298938) < 1e-12);
    assert.equal(calc.percentage(input.saf_spend, input.g_revenue, 'Well-being').value, 0.19);
    assert.ok(Math.abs(calc.percentage(input.div_wage_f, input.div_wage_t, 'Female wage share').value - 7) < 1e-12);
    assert.ok(Math.abs(calc.percentage(input.inc_msme, input.inc_totalpur, 'MSME share').value - 11) < 1e-12);
    assert.ok(Math.abs(calc.percentage(input.inc_town_wages, input.inc_total_wages, 'Small-town wages').value - 19.34) < 1e-12);
    assert.equal(calc.divide(input.fair_ap, input.fair_cogs, 365, 'DPO').value, 94);
    assert.ok(Math.abs(calc.percentage(input.open_top10, input.open_totalsales, 'Concentration').value - 29) < 1e-12);
    assert.ok(Math.abs(calc.percentage(input.open_rp, input.open_totcat, 'RPT').value - 39) < 1e-12);
});

test('Tata Steel fixture preserves the disclosed legacy-stock waste exception', () => {
    const input = fixture('TATA_STEEL_2025-26_BRSR_PROJECT.json').project.years['2026'].inputs;
    assert.equal(Number(input.wst_rec) + Number(input.wst_disp) - Number(input.wst_gen), 81904);
    assert.match(calc.percentage(input.wst_rec, input.wst_gen, 'Waste recycled').error, /reduce numerator/);
    assert.match(calc.wasteBalance(input.wst_gen, input.wst_rec, input.wst_disp).error, /until the totals balance/);
});

test('GRI range controls update during drag and defer full rendering', () => {
    const source = fs.readFileSync(path.join(root, 'js', 'gri.js'), 'utf8');
    const ranges = source.match(/<input type="range"[^>]+>/g) || [];
    assert.equal(ranges.length, 4);
    ranges.forEach(range => {
        assert.match(range, /oninput=/);
        assert.match(range, /onchange=/);
        assert.match(range, /this\.previousElementSibling\.textContent=/);
        assert.match(range, /oninput="[^"]+true/);
    });
});

test('BRSR well-being metric uses total revenue', () => {
    const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.match(source, /percentage\(saf_s, rev, 'Well-being spend percentage'/);
    assert.doesNotMatch(source, /saf_totalben|saf_tb/);
});
