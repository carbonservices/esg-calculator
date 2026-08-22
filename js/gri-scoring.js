(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.GRIScoring = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const omissionReasons = new Set(['not_applicable', 'legal_prohibition', 'confidentiality', 'unavailable']);
    const omissionProhibited = new Set(['2-1', '2-2', '2-3', '2-4', '2-5', '3-1', '3-2']);

    function validOmission(record, disclosureId = '3-3') {
        if (!record || record.status !== 'omitted' || omissionProhibited.has(disclosureId) || !omissionReasons.has(record.omissionReason)) return false;
        if (String(record.omissionExplanation || '').trim().length < 20) return false;
        if (record.omissionReason === 'unavailable') return String(record.omissionSteps || '').trim().length >= 20 && String(record.omissionTimeframe || '').trim().length >= 4;
        return true;
    }

    function reportedDisclosure(record, disclosureId) {
        if (validOmission(record, disclosureId)) return true;
        return Boolean(record) && record.status === 'complete' && String(record.response || '').trim().length >= 20;
    }

    function topicDisclosureCoverage(materialTopics, applicableTopics) {
        return materialTopics.length > 0 && materialTopics.every(topic => applicableTopics.some(item => {
            const links = String(item.record.materialTopicIds || '').split(',').map(value => value.trim()).filter(Boolean);
            return links.includes(topic.id) && reportedDisclosure(item.record, item.disclosure.id);
        }) || String(topic.record.alternativeDisclosures || '').trim().length >= 20);
    }

    function statusCompleteness(status, current, omissionValue) {
        if (status === 'complete') return 1;
        if (status === 'partial') return Math.min(0.95, Math.max(0.05, Number(current) || 0.5));
        if (status === 'missing' || status === 'not_assessed') return 0;
        if (status === 'omitted') return omissionValue === undefined ? 0 : omissionValue;
        return Math.min(1, Math.max(0, Number(current) || 0));
    }

    return { validOmission, reportedDisclosure, topicDisclosureCoverage, statusCompleteness };
}));
