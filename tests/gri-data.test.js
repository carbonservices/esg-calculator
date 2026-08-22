const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../js/gri-data.js');

test('registry contains the reviewed standards and unique disclosure keys', () => {
    assert.equal(data.disclosures.length, 137);
    assert.equal(data.standards.length, 36);
    assert.equal(new Set(data.disclosures.map(disclosure => disclosure.key)).size, data.disclosures.length);
});

test('GRI 14 V1.1 uses the consolidated climate topic sequence', () => {
    assert.ok(data.sector14Topics.some(topic => topic.id === '14.1' && topic.title === 'Climate change'));
    assert.ok(!data.sector14Topics.some(topic => topic.id === '14.2'));
    assert.ok(data.sector14Topics.some(topic => topic.id === '14.3' && topic.title === 'Air emissions'));
});

test('GRI 14 additional sector disclosures are separated from required disclosures', () => {
    assert.equal(data.sector14Recommendations.length, 22);
    assert.ok(data.sector14Recommendations.some(item => item.id === '14.0.1'));
    assert.ok(data.sector14Recommendations.some(item => item.id === '14.6.3'));
    assert.ok(data.sector14Recommendations.some(item => item.id === '14.15.4'));
    assert.ok(data.sector14Recommendations.some(item => item.id === '14.23.8'));
    assert.ok(!data.disclosures.some(disclosure => disclosure.id === '14.23.8'));
});

test('duplicate disclosure numbers retain standard-specific sector references', () => {
    assert.deepEqual(data.sector14References['GRI 306: Waste 2020:306-3'], ['14.5.4']);
    assert.deepEqual(data.sector14References['GRI 306: Effluents and Waste 2016:306-3'], ['14.15.2']);
});

test('known GRI 14 references and effective dates are locked', () => {
    assert.deepEqual(data.sector14References['GRI 101: Biodiversity 2024:101-1'], ['14.4.2']);
    assert.deepEqual(data.sector14References['GRI 303: Water and Effluents 2018:303-1'], ['14.7.2']);
    assert.deepEqual(data.sector14References['GRI 403: Occupational Health and Safety 2018:403-10'], ['14.16.11']);
    assert.deepEqual(data.sector14References['GRI 207: Tax 2019:207-4'], ['14.23.7']);
    assert.deepEqual(data.sector14References['GRI 415: Public Policy 2016:415-1'], ['14.24.2']);
    assert.equal(data.standards.find(standard => standard.id === 'gri101').effectiveFrom, '2026-01-01');
    assert.equal(data.standards.find(standard => standard.id === 'gri102').effectiveFrom, '2027-01-01');
    assert.equal(data.standards.find(standard => standard.id === 'gri103').effectiveFrom, '2027-01-01');
});

test('shared BRSR facts use composite keys', () => {
    assert.ok(data.sharedFieldMap.wst_gen.includes('GRI 306: Waste 2020:306-3'));
    assert.ok(!data.sharedFieldMap.wst_gen.includes('GRI 306: Effluents and Waste 2016:306-3'));
});

test('every GRI 14 mapping resolves to a disclosure and active V1.1 topic', () => {
    const keys = new Set(data.disclosures.map(disclosure => disclosure.key));
    const topics = new Set(data.sector14Topics.map(topic => topic.id));
    Object.entries(data.sector14References).forEach(([key, references]) => {
        assert.ok(keys.has(key), key);
        references.forEach(reference => assert.ok(topics.has(reference.split('.').slice(0, 2).join('.')), reference));
    });
});
