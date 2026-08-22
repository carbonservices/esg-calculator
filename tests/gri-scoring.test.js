const test = require('node:test');
const assert = require('node:assert/strict');
const scoring = require('../js/gri-scoring.js');

const complete = response => ({ status: 'complete', response });

test('a complete status requires a substantive response', () => {
    assert.equal(scoring.reportedDisclosure(complete('short'), '305-1'), false);
    assert.equal(scoring.reportedDisclosure(complete('A substantive response supported by reporting evidence.'), '305-1'), true);
});

test('omissions enforce prohibited disclosures and unavailable-information details', () => {
    const omission = { status: 'omitted', omissionReason: 'unavailable', omissionExplanation: 'The information is currently unavailable.', omissionSteps: 'Implement data collection across all operating sites.', omissionTimeframe: 'FY 2027' };
    assert.equal(scoring.validOmission(omission, '2-1'), false);
    assert.equal(scoring.validOmission(omission, '305-1'), true);
    assert.equal(scoring.validOmission({ ...omission, omissionSteps: 'Later' }, '305-1'), false);
});

test('every material topic needs a linked reported disclosure or documented alternative', () => {
    const topic = { id: 'M1', record: { alternativeDisclosures: '' } };
    assert.equal(scoring.topicDisclosureCoverage([topic], []), false);
    const item = { disclosure: { id: '305-1' }, record: { status: 'complete', response: 'Complete emissions disclosure response.', materialTopicIds: 'M1' } };
    assert.equal(scoring.topicDisclosureCoverage([topic], [item]), true);
    assert.equal(scoring.topicDisclosureCoverage([{ id: 'M2', record: { alternativeDisclosures: 'A documented non-GRI disclosure addressing this topic.' } }], []), true);
});

test('status changes keep completeness consistent', () => {
    assert.equal(scoring.statusCompleteness('complete', 0.4), 1);
    assert.equal(scoring.statusCompleteness('partial', 1), 0.95);
    assert.equal(scoring.statusCompleteness('missing', 0.8), 0);
    assert.equal(scoring.statusCompleteness('omitted', 0.8, 0.25), 0.25);
});
