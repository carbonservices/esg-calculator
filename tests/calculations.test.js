const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../js/calculations.js');

test('percentage calculates a valid ratio', () => {
    assert.deepEqual(calc.percentage(25, 100, 'Metric'), { value: 25, error: null });
});

test('percentage rejects a zero denominator', () => {
    assert.equal(calc.percentage(10, 0, 'Metric').value, null);
    assert.equal(calc.percentage(10, 0, 'Metric').error, 'Metric: enter denominator greater than 0.');
});

test('percentage rejects a numerator above its denominator', () => {
    assert.equal(calc.percentage(120, 100, 'Metric').value, null);
    assert.equal(calc.percentage(120, 100, 'Metric').error, 'Metric: reduce numerator to no more than denominator, or correct denominator.');
});

test('ratios reject negative numerators', () => {
    assert.equal(calc.percentage(-10, 100, 'Metric').value, null);
    assert.equal(calc.percentage(-10, 100, 'Metric').error, 'Metric: enter zero or a positive value for numerator.');
});

test('ratio guidance names the field the user must correct', () => {
    const result = calc.intensity(100, 0, 'Energy intensity', 'total energy', 'Total Revenue in BRSR Operational Data');
    assert.equal(result.error, 'Energy intensity: enter Total Revenue in BRSR Operational Data greater than 0.');
});

test('sum rejects invalid and negative line items', () => {
    assert.deepEqual(calc.sum([10, 20, 0], 'Water withdrawal'), { value: 30, errors: [] });
    assert.deepEqual(calc.sum(['', ''], 'Water withdrawal'), { value: null, errors: [] });
    const result = calc.sum([10, -1, ''], 'Water withdrawal');
    assert.equal(result.value, null);
    assert.equal(result.errors.length, 2);
});

test('whitespace is unavailable rather than a false zero', () => {
    assert.equal(calc.number('   '), null);
    assert.deepEqual(calc.sum([' ', '\t'], 'Energy'), { value: null, errors: [] });
});

test('water balance rejects discharge above withdrawal', () => {
    assert.equal(calc.waterBalance(90, 100).value, null);
});

test('waste balance reconciles generated waste', () => {
    assert.deepEqual(calc.wasteBalance(150, 90, 60), { value: 0, error: null });
    assert.equal(calc.wasteBalance(100, 80, 30).value, null);
});

test('GHG total retains row-level calculations', () => {
    const result = calc.ghgTotal([{ factor: 0.72, activity: 1500, scale: 1 }, { factor: 0.15, activity: 1000, scale: 0.001 }]);
    assert.equal(result.total, 1080.15);
    assert.deepEqual(result.values, [1080, 0.15]);
});

test('GHG total is unavailable when any row is invalid', () => {
    const result = calc.ghgTotal([{ factor: 0.72, activity: 1500, scale: 1 }, { factor: -1, activity: 1000, scale: 1 }]);
    assert.equal(result.total, null);
    assert.equal(result.values[1], null);
    assert.equal(result.errors.length, 1);
});

test('blank GHG rows do not create a false zero total', () => {
    const result = calc.ghgTotal([{ factor: 0.72, activity: '', scale: 1 }]);
    assert.equal(result.total, null);
    assert.deepEqual(result.errors, []);
});

test('whitespace-only GHG activity is treated as a blank row', () => {
    const result = calc.ghgTotal([{ factor: 0.72, activity: '  ', scale: 1 }]);
    assert.equal(result.total, null);
    assert.deepEqual(result.errors, []);
});

test('readiness keeps optional evidence relevance separate', () => {
    assert.equal(calc.disclosureReadiness(0.8, 0.75, 0.5, false), 60);
    assert.equal(calc.disclosureReadiness(0.8, 0.75, 0.5, true), 30);
});

test('weighted readiness excludes approved non-applicable rows', () => {
    const rows = [
        { completeness: 1, quality: 0.8, evidenceRelevance: 1, weight: 2 },
        { completeness: 0, quality: 0, evidenceRelevance: 0, weight: 1, excludeFromScore: true }
    ];
    assert.equal(calc.weightedReadiness(rows, false), 80);
});
