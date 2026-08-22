(function (root) {
    const omissionReasons = {
        not_applicable: 'Not applicable',
        legal_prohibition: 'Legal prohibitions',
        confidentiality: 'Confidentiality constraints',
        unavailable: 'Information unavailable or incomplete'
    };

    const omissionProhibited = new Set(['2-1', '2-2', '2-3', '2-4', '2-5', '3-1', '3-2']);
    const normalizedGRIStates = new WeakSet();

    function objectRecord(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
    }

    function inlineArgument(value) {
        return escapeHtml(JSON.stringify(String(value)));
    }

    function currentProject() {
        return appData.projects[appData.activeHash];
    }

    function trackGRI(action, params = {}) {
        if (typeof trackEvent === 'function') trackEvent(action, { framework: 'gri', ...params });
    }

    function currentYearData() {
        const project = currentProject();
        return project && project.years[project.currentFY];
    }

    function defaultDisclosure(disclosure) {
        const universal = disclosure.group === 'Universal';
        return {
            applicability: universal ? 'applicable' : 'not_selected',
            status: 'not_assessed',
            response: '',
            printedPage: '',
            pdfPage: '',
            evidenceReference: '',
            materialTopicIds: '',
            boundary: '',
            methodology: '',
            assuranceScope: '',
            omissionReason: '',
            omissionExplanation: '',
            omissionSteps: '',
            omissionTimeframe: '',
            sectorReference: '',
            completeness: 0,
            quality: 0,
            evidenceRelevance: 1,
            materiality: universal ? 'universal' : 'significant'
        };
    }

    function defaultTopic(id, title = '', decision = 'review') {
        return { id, title, decision, priority: 'significant', explanation: '', management: '', managementLocation: '', alternativeDisclosures: '', status: 'not_assessed', completeness: 0, quality: 0, evidenceRelevance: 1, omissionReason: '', omissionExplanation: '', omissionSteps: '', omissionTimeframe: '' };
    }

    function enumValue(value, allowed, fallback) {
        return allowed.includes(value) ? value : fallback;
    }

    function textValue(value, fallback = '') {
        return typeof value === 'string' ? value : fallback;
    }

    function boundedValue(value, fallback, minimum = 0, maximum = 1) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
    }

    function dateValue(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
        const date = new Date(`${value}T00:00:00Z`);
        return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? '' : value;
    }

    function normalizedTopic(saved, fallback) {
        const record = objectRecord(saved) ? saved : {};
        return {
            ...fallback,
            ...record,
            id: textValue(record.id, fallback.id),
            title: textValue(record.title, fallback.title),
            decision: enumValue(record.decision, ['review', 'material', 'not_material'], fallback.decision),
            priority: enumValue(record.priority, ['crucial', 'significant', 'low'], fallback.priority),
            status: enumValue(record.status, ['not_assessed', 'complete', 'partial', 'missing', 'omitted'], fallback.status),
            completeness: boundedValue(record.completeness, fallback.completeness),
            quality: boundedValue(record.quality, fallback.quality),
            evidenceRelevance: boundedValue(record.evidenceRelevance, fallback.evidenceRelevance),
            explanation: textValue(record.explanation),
            management: textValue(record.management),
            managementLocation: textValue(record.managementLocation),
            alternativeDisclosures: textValue(record.alternativeDisclosures),
            omissionReason: enumValue(record.omissionReason, ['', ...Object.keys(omissionReasons)], ''),
            omissionExplanation: textValue(record.omissionExplanation),
            omissionSteps: textValue(record.omissionSteps),
            omissionTimeframe: textValue(record.omissionTimeframe)
        };
    }

    function normalizedDisclosure(saved, disclosure) {
        const fallback = defaultDisclosure(disclosure);
        const record = objectRecord(saved) ? saved : {};
        const textFields = ['response', 'printedPage', 'pdfPage', 'evidenceReference', 'materialTopicIds', 'boundary', 'methodology', 'assuranceScope', 'omissionExplanation', 'omissionSteps', 'omissionTimeframe', 'sectorReference'];
        const normalized = {
            ...fallback,
            ...record,
            applicability: enumValue(record.applicability, ['not_selected', 'applicable'], fallback.applicability),
            status: enumValue(record.status, ['not_assessed', 'complete', 'partial', 'missing', 'omitted'], fallback.status),
            materiality: disclosure.group === 'Universal' ? 'universal' : enumValue(record.materiality, ['crucial', 'significant', 'low'], fallback.materiality),
            omissionReason: enumValue(record.omissionReason, ['', ...Object.keys(omissionReasons)], ''),
            completeness: boundedValue(record.completeness, fallback.completeness),
            quality: boundedValue(record.quality, fallback.quality),
            evidenceRelevance: boundedValue(record.evidenceRelevance, fallback.evidenceRelevance)
        };
        textFields.forEach(field => { normalized[field] = textValue(record[field]); });
        return normalized;
    }

    function defaultGRIState() {
        const selectedStandards = {};
        GRIData.standards.forEach(standard => { selectedStandards[standard.id] = Boolean(standard.universal); });
        return {
            profile: {
                reportingStart: '',
                reportingEnd: '',
                publicationDate: '',
                sector: 'undetermined',
                sectorRationale: '',
                earlyAdoption: false,
                materialityProcessConfirmed: false,
                reportingPrinciplesConfirmed: false,
                statementConfirmed: false,
                notificationStatus: 'not_verified'
            },
            selectedStandards,
            useEvidenceRelevance: false,
            weights: { universal: 1, crucial: 1.85, significant: 1.65, low: 1.35, legalProhibition: 0.5, confidentiality: 0.25, unavailable: 0 },
            metricCategory: 'environmental',
            metricOpenGroups: { environmental: 'emissions', people: 'workforce', economic: 'economicValue' },
            metrics: GRIMetrics.defaultValues(),
            topics: {},
            customTopics: [],
            recommendations: {},
            disclosures: {},
            filters: { search: '', standard: 'all', status: 'all', group: 'all' }
        };
    }

    function applyDemoGRIState(state) {
        Object.assign(state.profile, {
            reportingStart: '2025-04-01', reportingEnd: '2026-03-31', publicationDate: '2026-08-15', sector: 'not_applicable',
            sectorRationale: 'Illustrative manufacturing organization with no applicable published GRI Sector Standard.',
            materialityProcessConfirmed: true, reportingPrinciplesConfirmed: false, statementConfirmed: false, notificationStatus: 'planned'
        });
        state.metrics = GRIMetrics.demoValues();
        state.customTopics = [
            { ...defaultTopic('DEMO-ENV', 'Energy, emissions, water and waste', 'material'), priority: 'crucial', management: 'Illustrative management response covering environmental impacts, targets, controls and effectiveness.', managementLocation: 'Sample report pp. 20-35', status: 'complete', completeness: 0.9, quality: 0.8 },
            { ...defaultTopic('DEMO-PEOPLE', 'Workforce health, safety and development', 'material'), priority: 'significant', management: 'Illustrative management response covering workforce impacts, controls, training and safety outcomes.', managementLocation: 'Sample report pp. 36-44', status: 'complete', completeness: 0.85, quality: 0.8 },
            { ...defaultTopic('DEMO-ECON', 'Economic value and responsible supply chain', 'material'), priority: 'significant', management: 'Illustrative management response covering economic value, local procurement and supplier screening.', managementLocation: 'Sample report pp. 45-52', status: 'complete', completeness: 0.8, quality: 0.75 }
        ];
        ['gri201','gri204','gri302','gri303','gri305','gri306w','gri308','gri403','gri404','gri414'].forEach(id => { state.selectedStandards[id] = true; });
        const universal = GRIData.disclosures.filter(disclosure => disclosure.group === 'Universal' && disclosure.id !== '3-3');
        universal.forEach((disclosure, index) => {
            const record = state.disclosures[disclosure.key];
            Object.assign(record, { applicability: 'applicable', status: index < 12 ? 'complete' : 'partial', printedPage: `${index + 5}`, response: 'Illustrative response for interface demonstration; replace with approved reporting evidence.', completeness: index < 12 ? 0.9 : 0.55, quality: index < 12 ? 0.8 : 0.65 });
        });
        const mappings = {
            'GRI 201: Economic Performance 2016:201-1':'DEMO-ECON',
            'GRI 204: Procurement Practices 2016:204-1':'DEMO-ECON',
            'GRI 302: Energy 2016:302-1':'DEMO-ENV', 'GRI 302: Energy 2016:302-3':'DEMO-ENV',
            'GRI 303: Water and Effluents 2018:303-3':'DEMO-ENV', 'GRI 303: Water and Effluents 2018:303-4':'DEMO-ENV', 'GRI 303: Water and Effluents 2018:303-5':'DEMO-ENV',
            'GRI 305: Emissions 2016:305-1':'DEMO-ENV', 'GRI 305: Emissions 2016:305-2':'DEMO-ENV', 'GRI 305: Emissions 2016:305-3':'DEMO-ENV', 'GRI 305: Emissions 2016:305-4':'DEMO-ENV',
            'GRI 306: Waste 2020:306-3':'DEMO-ENV', 'GRI 306: Waste 2020:306-4':'DEMO-ENV', 'GRI 306: Waste 2020:306-5':'DEMO-ENV',
            'GRI 308: Supplier Environmental Assessment 2016:308-1':'DEMO-ECON', 'GRI 403: Occupational Health and Safety 2018:403-9':'DEMO-PEOPLE',
            'GRI 404: Training and Education 2016:404-1':'DEMO-PEOPLE', 'GRI 414: Supplier Social Assessment 2016:414-1':'DEMO-ECON'
        };
        Object.entries(mappings).forEach(([key, topicId], index) => {
            const record = state.disclosures[key];
            if (!record) return;
            const complete = index % 4 !== 3;
            Object.assign(record, { applicability: 'applicable', status: complete ? 'complete' : 'partial', printedPage: complete ? `${60 + index}` : '', response: 'Illustrative metric disclosure; replace values, boundary, method and evidence.', materialTopicIds: topicId, boundary: 'Illustrative reporting boundary', methodology: 'Illustrative method; verify against the effective standard', completeness: complete ? 0.9 : 0.6, quality: complete ? 0.82 : 0.65 });
        });
        state.demoSeeded = true;
    }

    function normalizeGRIState(project, data) {
        if (!project || !data) return null;
        if (!project.framework) project.framework = 'brsr';
        if (objectRecord(data.gri) && normalizedGRIStates.has(data.gri)) return data.gri;
        const defaults = defaultGRIState();
        if (!objectRecord(data.gri)) data.gri = defaults;
        const savedProfile = objectRecord(data.gri.profile) ? data.gri.profile : {};
        data.gri.profile = {
            ...defaults.profile,
            reportingStart: dateValue(savedProfile.reportingStart),
            reportingEnd: dateValue(savedProfile.reportingEnd),
            publicationDate: dateValue(savedProfile.publicationDate),
            sector: enumValue(savedProfile.sector === 'none' ? 'undetermined' : savedProfile.sector, ['undetermined', 'not_applicable', 'gri14'], 'undetermined'),
            sectorRationale: textValue(savedProfile.sectorRationale),
            earlyAdoption: savedProfile.earlyAdoption === true,
            materialityProcessConfirmed: savedProfile.materialityProcessConfirmed === true,
            reportingPrinciplesConfirmed: savedProfile.reportingPrinciplesConfirmed === true,
            statementConfirmed: savedProfile.statementConfirmed === true,
            notificationStatus: enumValue(savedProfile.notificationStatus, ['not_verified', 'planned', 'verified'], 'not_verified')
        };
        const savedStandards = objectRecord(data.gri.selectedStandards) ? data.gri.selectedStandards : {};
        data.gri.selectedStandards = Object.fromEntries(GRIData.standards.map(standard => [standard.id, standard.universal || savedStandards[standard.id] === true]));
        data.gri.useEvidenceRelevance = data.gri.useEvidenceRelevance === true;
        data.gri.weights = { ...defaults.weights, ...(objectRecord(data.gri.weights) ? data.gri.weights : {}) };
        if (!['environmental','people','economic'].includes(data.gri.metricCategory)) data.gri.metricCategory = 'environmental';
        data.gri.metricOpenGroups = { ...defaults.metricOpenGroups, ...(objectRecord(data.gri.metricOpenGroups) ? data.gri.metricOpenGroups : {}) };
        GRIMetrics.categories.forEach(category => {
            if (!category.groups.some(group => group.id === data.gri.metricOpenGroups[category.id])) data.gri.metricOpenGroups[category.id] = category.groups[0].id;
        });
        const savedMetrics = objectRecord(data.gri.metrics) ? data.gri.metrics : {};
        data.gri.metrics = GRIMetrics.normalizeValues(savedMetrics);
        Object.entries(defaults.weights).forEach(([key, fallback]) => {
            const value = Number(data.gri.weights[key]);
            const omission = ['legalProhibition', 'confidentiality', 'unavailable'].includes(key);
            data.gri.weights[key] = Number.isFinite(value) && (omission ? value >= 0 && value <= 1 : value > 0) ? value : fallback;
        });
        if (!objectRecord(data.gri.topics)) data.gri.topics = {};
        if (!Array.isArray(data.gri.customTopics)) data.gri.customTopics = [];
        const topicIds = new Set();
        data.gri.customTopics = data.gri.customTopics.filter(objectRecord).filter(topic => typeof topic.id === 'string' && /^[A-Za-z0-9._:-]{1,80}$/.test(topic.id) && !topicIds.has(topic.id) && topicIds.add(topic.id)).map(topic => normalizedTopic(topic, defaultTopic(topic.id, textValue(topic.title), 'material'))).map(topic => ({ ...topic, decision: 'material' }));
        if (!objectRecord(data.gri.recommendations)) data.gri.recommendations = {};
        const recommendations = {};
        GRIData.sector14Recommendations.forEach(recommendation => {
            const saved = data.gri.recommendations[recommendation.id];
            const record = objectRecord(saved) ? saved : {};
            recommendations[recommendation.id] = { status: enumValue(record.status, ['not_assessed', 'planned', 'reported', 'not_planned'], 'not_assessed'), response: textValue(record.response), location: textValue(record.location) };
        });
        data.gri.recommendations = recommendations;
        if (!objectRecord(data.gri.disclosures)) data.gri.disclosures = {};
        const savedFilters = objectRecord(data.gri.filters) ? data.gri.filters : {};
        data.gri.filters = {
            search: textValue(savedFilters.search),
            standard: savedFilters.standard === 'all' || GRIData.standards.some(standard => standard.id === savedFilters.standard) ? savedFilters.standard : 'all',
            status: enumValue(savedFilters.status, ['all', 'not_assessed', 'complete', 'partial', 'missing', 'omitted'], 'all'),
            group: enumValue(savedFilters.group, ['all', 'Universal', 'Economic', 'Environmental', 'Social'], 'all')
        };
        const topics = {};
        GRIData.sector14Topics.forEach(topic => {
            const saved = data.gri.topics[topic.id];
            topics[topic.id] = normalizedTopic(saved, defaultTopic(topic.id, topic.title));
        });
        data.gri.topics = topics;
        const disclosures = {};
        GRIData.disclosures.forEach(disclosure => {
            const saved = data.gri.disclosures[disclosure.key];
            disclosures[disclosure.key] = normalizedDisclosure(saved, disclosure);
        });
        data.gri.disclosures = disclosures;
        data.gri.demoSeeded = data.gri.demoSeeded === true;
        normalizedGRIStates.add(data.gri);
        return data.gri;
    }

    function initializeGRIState(project, data, financialYear) {
        if (!project || !data) return null;
        const seedDemo = !objectRecord(data.gri) && project.demo === true && financialYear === '2026';
        const state = normalizeGRIState(project, data);
        if (seedDemo && !state.demoSeeded) applyDemoGRIState(state);
        return state;
    }

    function ensureGRIState() {
        const project = currentProject();
        const data = currentYearData();
        if (!project || !data || !objectRecord(data.gri) || !normalizedGRIStates.has(data.gri)) throw new Error('GRI state is not initialized. Reload the current reporting year and try again.');
        return data.gri;
    }

    function standardByTitle(title) {
        return GRIData.standards.find(standard => standard.title === title);
    }

    function selectedDisclosures() {
        const state = ensureGRIState();
        return GRIData.disclosures.filter(disclosure => disclosure.id !== '3-3' && (() => {
            const standard = standardByTitle(disclosure.standard);
            return standard && state.selectedStandards[standard.id];
        })());
    }

    function disclosureWeight(record) {
        const weights = ensureGRIState().weights;
        if (record.materiality === 'universal') return weights.universal;
        if (record.materiality === 'crucial') return weights.crucial;
        if (record.materiality === 'low') return weights.low;
        return weights.significant;
    }

    function validOmission(record, disclosureId = '3-3') {
        return GRIScoring.validOmission(record, disclosureId);
    }

    function reportedDisclosure(record, disclosureId) {
        return GRIScoring.reportedDisclosure(record, disclosureId);
    }

    function activeMaterialTopics() {
        const state = ensureGRIState();
        const sectorTopics = state.profile.sector === 'gri14' ? GRIData.sector14Topics.filter(topic => state.topics[topic.id].decision === 'material').map(topic => ({ id: topic.id, title: topic.title, record: state.topics[topic.id], sector: true })) : [];
        const customTopics = state.customTopics.filter(topic => topic.title.trim()).map(topic => ({ id: topic.id, title: topic.title, record: topic, sector: false }));
        return [...sectorTopics, ...customTopics];
    }

    function sectorReferences(disclosure, materialOnly = false) {
        const state = ensureGRIState();
        const references = GRIData.sector14References[disclosure.key] || [];
        if (!materialOnly || state.profile.sector !== 'gri14') return references;
        return references.filter(reference => state.topics[reference.split('.').slice(0, 2).join('.')]?.decision === 'material');
    }

    function topicWeight(record) {
        return disclosureWeight({ materiality: record.priority });
    }

    function scoredRows() {
        const state = ensureGRIState();
        return selectedDisclosures().filter(disclosure => state.disclosures[disclosure.key].applicability === 'applicable').map(disclosure => {
            const record = state.disclosures[disclosure.key];
            return {
                group: disclosure.standard,
                category: disclosure.group,
                completeness: record.completeness,
                quality: record.quality,
                evidenceRelevance: record.evidenceRelevance,
                weight: disclosureWeight(record),
                excludeFromScore: validOmission(record, disclosure.id) && record.omissionReason === 'not_applicable'
            };
        }).concat(activeMaterialTopics().map(topic => ({
            group: 'GRI 3: Disclosure 3-3 by material topic',
            category: 'Universal',
            completeness: topic.record.completeness,
            quality: topic.record.quality,
            evidenceRelevance: topic.record.evidenceRelevance,
            weight: topicWeight(topic.record),
            excludeFromScore: validOmission(topic.record) && topic.record.omissionReason === 'not_applicable'
        })));
    }

    function readiness() {
        const state = ensureGRIState();
        return {
            base: ESGCalculations.weightedReadiness(scoredRows(), false),
            evidenceAdjusted: ESGCalculations.weightedReadiness(scoredRows(), true),
            useEvidenceRelevance: state.useEvidenceRelevance
        };
    }

    function readinessBreakdown() {
        const state = ensureGRIState();
        const groups = new Map();
        scoredRows().forEach(row => {
            if (!groups.has(row.group)) groups.set(row.group, []);
            groups.get(row.group).push(row);
        });
        return [...groups.entries()].map(([group, rows]) => ({
            group,
            count: rows.filter(row => !row.excludeFromScore).length,
            score: ESGCalculations.weightedReadiness(rows, state.useEvidenceRelevance)
        }));
    }

    function validateVersions() {
        const state = ensureGRIState();
        const date = state.profile.publicationDate;
        const warnings = [];
        if (state.profile.reportingStart && state.profile.reportingEnd && state.profile.reportingStart > state.profile.reportingEnd) warnings.push('Set Reporting period start on or before Reporting period end.');
        if (date && state.profile.reportingEnd && date < state.profile.reportingEnd) warnings.push('Set Publication date on or after Reporting period end.');
        if (!date) return [...warnings, 'Enter the report publication date to validate standard editions.'];
        GRIData.standards.filter(standard => state.selectedStandards[standard.id]).forEach(standard => {
            if (standard.effectiveFrom && date < standard.effectiveFrom && !state.profile.earlyAdoption) warnings.push(`For ${standard.title}, confirm documented early adoption or select the predecessor effective on ${date}.`);
            if (standard.supersededFrom && date >= standard.supersededFrom) warnings.push(`Replace ${standard.title} with ${standard.supersededBy} for publication on or after ${standard.supersededFrom}.`);
            if (standard.partiallySupersededFrom && date >= standard.partiallySupersededFrom) warnings.push(`Replace ${standard.supersededDisclosures.join(', ')} with ${standard.supersededBy} for publication on or after ${standard.partiallySupersededFrom}.`);
        });
        if (state.profile.sector === 'gri14' && date < '2026-01-01' && !state.profile.earlyAdoption) warnings.push('For GRI 14 before 1 January 2026, confirm documented early adoption or select the standard effective for the period.');
        return warnings;
    }

    function validSectorReference(disclosure, record) {
        const expected = sectorReferences(disclosure, true);
        if (!expected.length) return true;
        const actual = String(record.sectorReference || '').split(/[;,\s]+/).filter(Boolean);
        return expected.every(reference => actual.includes(reference));
    }

    function topicManagementResolved(topic) {
        if (validOmission(topic.record)) return true;
        return topic.record.status === 'complete' && String(topic.record.management || '').trim().length >= 20 && String(topic.record.managementLocation || '').trim().length > 0;
    }

    function evaluateGates() {
        const state = ensureGRIState();
        const selected = selectedDisclosures();
        const records = selected.map(disclosure => ({ disclosure, record: state.disclosures[disclosure.key] }));
        const resolved = item => item.record.applicability === 'applicable' && reportedDisclosure(item.record, item.disclosure.id);
        const gri2 = records.filter(item => item.disclosure.standard.startsWith('GRI 2:'));
        const gri3 = records.filter(item => item.disclosure.standard.startsWith('GRI 3:'));
        const topics = state.profile.sector === 'gri14' ? GRIData.sector14Topics.map(topic => state.topics[topic.id]) : [];
        const materialTopics = activeMaterialTopics();
        const applicableTopics = records.filter(item => item.disclosure.group !== 'Universal' && item.record.applicability === 'applicable');
        const omissions = records.filter(item => item.record.status === 'omitted').concat(materialTopics.filter(topic => topic.record.status === 'omitted').map(topic => ({ disclosure: { id: '3-3' }, record: topic.record })));
        const indexRows = records.filter(item => item.record.applicability === 'applicable');
        const materialTopicIds = new Set(materialTopics.map(topic => topic.id));
        const topicDisclosureCoverage = GRIScoring.topicDisclosureCoverage(materialTopics, applicableTopics);
        const sectorReviewResolved = state.profile.sector === 'gri14'
            ? topics.every(topic => topic.decision === 'material' || (topic.decision === 'not_material' && String(topic.explanation || '').trim().length >= 20))
            : state.profile.sector === 'not_applicable' && String(state.profile.sectorRationale || '').trim().length >= 20;
        const requiredSectorDisclosures = state.profile.sector === 'gri14' ? GRIData.disclosures.filter(disclosure => sectorReferences(disclosure, true).length > 0) : [];
        const requiredSectorResolved = requiredSectorDisclosures.every(disclosure => {
            const standard = standardByTitle(disclosure.standard);
            const record = state.disclosures[disclosure.key];
            return Boolean(standard && state.selectedStandards[standard.id] && record.applicability === 'applicable' && reportedDisclosure(record, disclosure.id));
        });
        const indexValid = indexRows.every(item => {
            if (item.disclosure.group !== 'Universal') {
                const links = String(item.record.materialTopicIds || '').split(',').map(value => value.trim()).filter(Boolean);
                if (!links.length || links.some(id => !materialTopicIds.has(id))) return false;
            }
            if (validOmission(item.record, item.disclosure.id)) return validSectorReference(item.disclosure, item.record);
            if (item.record.status !== 'complete') return false;
            if (!String(item.record.printedPage || '').trim() && !String(item.record.pdfPage || '').trim() && !String(item.record.evidenceReference || '').trim()) return false;
            return validSectorReference(item.disclosure, item.record);
        });
        const periodValid = state.profile.reportingStart && state.profile.reportingEnd && state.profile.reportingStart <= state.profile.reportingEnd;
        const nameValid = String(currentProject().meta.name || currentProject().name || '').trim().length > 0;
        const topicIndexValid = materialTopics.every(topicManagementResolved);
        const versionsValid = validateVersions().length === 0;
        return [
            ['1', 'Reporting principles applied', state.profile.reportingPrinciplesConfirmed, 'Review the reporting principles, retain evidence, then confirm them in Reporting Setup.'],
            ['2', 'Required GRI 2 disclosures reported', gri2.length > 0 && gri2.every(resolved), 'Complete every selected GRI 2 disclosure or record a permitted omission.'],
            ['3', 'Material topics determined using applicable Sector Standards', state.profile.materialityProcessConfirmed && sectorReviewResolved && materialTopics.length > 0, 'Set sector applicability, assess every sector topic, record at least one material topic, then confirm the process.'],
            ['4', 'GRI 3 disclosures reported for every material topic', materialTopics.length > 0 && gri3.length === 2 && gri3.every(resolved) && topicIndexValid, 'Complete GRI 3 and add a management response and report location for every material topic.'],
            ['5', 'Relevant Topic Standard disclosures reported', materialTopics.length > 0 && topicDisclosureCoverage && applicableTopics.every(resolved) && requiredSectorResolved && versionsValid, 'Link at least one completed disclosure to each material topic, or document why another appropriate disclosure is used, then resolve standard-edition warnings.'],
            ['6', 'Only permitted omissions used with required explanations', omissions.every(item => validOmission(item.record, item.disclosure.id)), 'Choose a permitted omission reason and complete its required explanation, steps, or timeframe.'],
            ['7', 'Compliant GRI Content Index prepared', indexRows.length > 0 && indexValid && topicIndexValid && sectorReviewResolved, 'Add valid topic links, report locations, omission details, and sector references to each index row.'],
            ['8', 'Exact statement of use confirmed', state.profile.statementConfirmed && periodValid && nameValid, 'Enter the company name and valid reporting period, then confirm the statement of use.'],
            ['9', 'GRI notification verified', state.profile.notificationStatus === 'verified', 'Notify GRI, then set notification status to Verified in Reporting Setup.']
        ];
    }

    function getSharedInputIds(disclosureKey) {
        return Object.entries(GRIData.sharedFieldMap).filter(([, keys]) => keys.includes(disclosureKey)).map(([field]) => field);
    }

    function sharedFactSummary(disclosureKey) {
        const ids = getSharedInputIds(disclosureKey);
        if (!ids.length) return '';
        return ids.map(id => {
            const element = document.getElementById(id);
            const value = element ? element.value : currentYearData().inputs[id];
            return `${id}: ${value === '' || value === undefined ? 'not entered' : value}`;
        }).join(' · ');
    }

    const griCharts = {};

    function referenceFooter() {
        return `<div class="mt-8 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"><i class="fa-solid fa-book-open mr-2 text-blue-500"></i>Input structures and formula prompts are derived from the GRI Standards PDFs reviewed for this application. They are implementation aids, not substitutes for the standards. Verify the effective edition and complete requirements at <a href="https://www.globalreporting.org/standards/" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">GRI Standards</a>.</div>`;
    }

    function categoryReadiness() {
        const state = ensureGRIState();
        return ['Universal','Economic','Environmental','Social'].map(category => {
            const rows = scoredRows().filter(row => row.category === category);
            return { category, score: ESGCalculations.weightedReadiness(rows, state.useEvidenceRelevance), count: rows.filter(row => !row.excludeFromScore).length };
        });
    }

    function formatMetric(result, digits = 2) {
        if (!result || result.value === null || !Number.isFinite(result.value)) return 'Enter metric inputs';
        return `${result.value.toLocaleString(undefined, { maximumFractionDigits: digits })} ${result.unit}`;
    }

    function renderGRICharts(state, applicable) {
        if (typeof Chart === 'undefined') return;
        Object.values(griCharts).forEach(chart => chart.destroy());
        Object.keys(griCharts).forEach(key => { delete griCharts[key]; });
        const categories = categoryReadiness();
        const categoryCanvas = document.getElementById('gri-category-chart');
        const statusCanvas = document.getElementById('gri-status-chart');
        if (categoryCanvas) griCharts.category = new Chart(categoryCanvas, {
            type: 'bar',
            data: { labels: categories.map(item => item.category), datasets: [{ label: 'Internal readiness', data: categories.map(item => item.score), backgroundColor: ['#6366f1','#f59e0b','#10b981','#0ea5e9'], borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });
        const statuses = ['complete','partial','omitted','not_assessed','missing'];
        if (statusCanvas) griCharts.status = new Chart(statusCanvas, {
            type: 'doughnut',
            data: { labels: ['Complete','Partial','Omitted','Not assessed','Missing'], datasets: [{ data: statuses.map(status => applicable.filter(disclosure => state.disclosures[disclosure.key].status === status).length), backgroundColor: ['#10b981','#f59e0b','#8b5cf6','#94a3b8','#ef4444'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    function griAmbitionsPanel() {
        const project = currentProject();
        const ambitions = Array.isArray(project.ambitions) ? project.ambitions.filter(ambition => targetDefinitions[ambition.metric]?.result) : [];
        const cards = ambitions.map(ambition => {
            const definition = targetDefinitions[ambition.metric];
            const actual = targetActual(project, ambition);
            const available = Number.isFinite(actual);
            const onTrack = available && (definition.lower ? actual <= ambition.target : actual >= ambition.target);
            return `<div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"><div class="text-xs uppercase text-slate-500">${escapeHtml(definition.label)}</div><div class="mt-2 text-xl font-bold">${available ? escapeHtml(actual.toLocaleString(undefined, { maximumFractionDigits: 2 })) : 'Enter metric inputs'}${available ? ` <span class="text-sm font-normal text-slate-500">${escapeHtml(definition.unit)}</span>` : ''}</div><div class="mt-2 text-xs ${available ? onTrack ? 'text-emerald-600' : 'text-red-600' : 'text-slate-500'}">${available ? onTrack ? 'On track' : 'Off track' : 'Actual unavailable'} · Target ${escapeHtml(ambition.target.toLocaleString())} by ${escapeHtml(ambition.year)}</div></div>`;
        }).join('');
        return `<div class="mb-6"><div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3"><div><h3 class="text-xl font-bold">GRI ambitions</h3><p class="text-xs text-slate-500">Current calculated GRI results compared with shared workspace targets.</p></div><button type="button" onclick="openTab('tab-ambitions')" class="text-sm font-semibold text-blue-600 dark:text-blue-400">Manage ambitions →</button></div><div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">${cards || '<div class="sm:col-span-2 xl:col-span-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">Add a GRI ambition to track it on this dashboard.</div>'}</div></div>`;
    }

    function renderOverview() {
        const rootElement = document.getElementById('gri-overview-root');
        if (!rootElement) return;
        const project = currentProject();
        const state = ensureGRIState();
        const result = readiness();
        const gates = evaluateGates();
        const passed = gates.filter(gate => gate[2]).length;
        const selected = selectedDisclosures();
        const applicable = selected.filter(disclosure => state.disclosures[disclosure.key].applicability === 'applicable');
        const complete = applicable.filter(disclosure => state.disclosures[disclosure.key].status === 'complete').length;
        const score = result.useEvidenceRelevance ? result.evidenceAdjusted : result.base;
        const breakdown = readinessBreakdown();
        const metrics = GRIMetrics.calculate(state.metrics).results;
        const metricCards = [metrics.grossEmissions, metrics.netEnergy, metrics.waterConsumption, metrics.wasteDiversionRate, metrics.employeeInjuryRate, metrics.economicRetained];
        rootElement.innerHTML = `
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div><h2 class="text-3xl font-extrabold text-slate-800 dark:text-white">GRI Reporting Dashboard</h2><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">A holistic internal view of readiness, compliance and calculated metrics. It is not an official GRI score.</p></div>
                <div class="flex flex-wrap gap-2"><button type="button" onclick="runWorkspaceValidation()" class="border border-blue-600 bg-white text-blue-700 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-300 px-4 py-2 rounded-lg font-semibold"><i class="fa-solid fa-list-check mr-2"></i>Run Validation</button><button type="button" onclick="downloadGRIDashboardPDF()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold"><i class="fa-solid fa-file-pdf mr-2"></i>Export Dashboard PDF</button><button type="button" onclick="downloadGRIMarkdown()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"><i class="fa-solid fa-download mr-2"></i>Export Content Index</button><button type="button" onclick="downloadProjectJSON()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold"><i class="fa-solid fa-file-export mr-2"></i>Export JSON</button><label class="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg font-semibold"><i class="fa-solid fa-file-import mr-2"></i>Load JSON<input type="file" accept="application/json,.json" class="hidden" onchange="importProjectJSON(this.files[0]); this.value=''"></label></div>
            </div>
            <div id="gri-dashboard-export-area" class="rounded-xl">
                <div data-pdf-only class="hidden mb-6"><h2 class="text-3xl font-extrabold text-slate-800">${escapeHtml(project.meta.name || project.name)} — GRI Reporting Dashboard</h2><p class="text-sm text-slate-500 mt-1">Reporting year ${escapeHtml(project.currentFY)} · Reporting period ${escapeHtml(reportingPeriod())}</p></div>
                ${currentProject().demo ? '<div class="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"><strong>Illustrative sample workspace.</strong> Values demonstrate the dashboard and formulas only. Create a new workspace for blank reporting records.</div>' : ''}
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><div class="text-xs uppercase text-slate-500">Internal readiness</div><div class="text-4xl font-bold text-blue-600 mt-2">${score.toFixed(1)}</div><div class="text-xs text-slate-500 mt-1">${result.useEvidenceRelevance ? 'Evidence-adjusted C × Q × E' : 'Base C × Q'}</div></div>
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><div class="text-xs uppercase text-slate-500">Compliance gates</div><div class="text-4xl font-bold ${passed === 9 ? 'text-emerald-600' : 'text-amber-600'} mt-2">${passed}/9</div><div class="text-xs text-slate-500 mt-1">All nine must pass</div></div>
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><div class="text-xs uppercase text-slate-500">Applicable disclosures</div><div class="text-4xl font-bold text-slate-800 dark:text-white mt-2">${applicable.length}</div><div class="text-xs text-slate-500 mt-1">${selected.length} in selected standards</div></div>
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><div class="text-xs uppercase text-slate-500">Completed</div><div class="text-4xl font-bold text-slate-800 dark:text-white mt-2">${complete}</div><div class="text-xs text-slate-500 mt-1">${applicable.length ? (100 * complete / applicable.length).toFixed(0) : 0}% of applicable rows</div></div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><h3 class="font-bold mb-3">Readiness by reporting category</h3><div data-pdf-chart class="h-72"><canvas id="gri-category-chart"></canvas></div></div>
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><h3 class="font-bold mb-3">Applicable disclosure status</h3><div data-pdf-chart class="h-72"><canvas id="gri-status-chart"></canvas></div></div>
                </div>
                <div class="mb-6"><div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3"><div><h3 class="text-xl font-bold">Calculated reporting indicators</h3><p class="text-xs text-slate-500">Values come from the saved GRI Metrics workspace and preserve their disclosed formula context.</p></div><button type="button" onclick="openTab('tab-gri-metrics')" class="text-sm font-semibold text-blue-600 dark:text-blue-400">Review metric inputs →</button></div><div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">${metricCards.map(metric => `<div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4"><div class="text-xs uppercase text-slate-500">${escapeHtml(metric?.label || 'Metric not entered')}</div><div class="text-xl font-bold mt-2 text-slate-800 dark:text-white">${escapeHtml(formatMetric(metric))}</div><div class="text-xs text-slate-500 mt-2">${escapeHtml(metric?.formula || 'Complete the related metric inputs.')}</div></div>`).join('')}</div></div>
                ${griAmbitionsPanel()}
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden"><div class="p-4 border-b border-slate-200 dark:border-slate-700"><h3 class="font-bold">Nine GRI 1 compliance gates</h3></div>${gates.map(gate => `<div class="flex items-start gap-3 p-4 border-b last:border-0 border-slate-200 dark:border-slate-700"><i class="fa-solid ${gate[2] ? 'fa-circle-check text-emerald-500' : 'fa-circle-xmark text-red-500'} mt-1"></i><div><strong>${gate[0]}. ${escapeHtml(gate[1])}</strong><div class="text-xs text-slate-500 mt-1">${gate[2] ? 'Complete.' : escapeHtml(gate[3])}</div></div></div>`).join('')}</div>
                    <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden"><div class="p-4 border-b border-slate-200 dark:border-slate-700"><h3 class="font-bold">Readiness by standard</h3><p class="text-xs text-slate-500 mt-1">R = 100 × completeness × quality${state.useEvidenceRelevance ? ' × optional evidence relevance' : ''}. Internal only.</p></div><div data-pdf-expand class="max-h-[34rem] overflow-y-auto"><table data-pdf-compact class="w-full text-left"><thead class="bg-slate-100 dark:bg-slate-900 sticky top-0"><tr><th class="p-3">Standard</th><th class="p-3 text-right">Rows</th><th class="p-3 text-right">Score</th></tr></thead><tbody>${breakdown.map(item => `<tr class="border-t border-slate-200 dark:border-slate-700"><td class="p-3 text-sm">${escapeHtml(item.group)}</td><td class="p-3 text-sm text-right">${item.count}</td><td class="p-3 text-sm text-right font-mono">${item.score.toFixed(1)}</td></tr>`).join('')}</tbody></table></div></div>
                </div>
            </div>${referenceFooter()}`;
        renderGRICharts(state, applicable);
    }

    function metricInput(field, values) {
        const [id, label, unit, type, options] = field;
        const value = values[id] ?? '';
        if (type === 'select') return `<div><label for="gri-metric-${id}" class="text-sm font-medium">${escapeHtml(label)}</label><select id="gri-metric-${id}" onchange="updateGRIMetric('${id}',this.value)">${options.map(option => `<option value="${option[0]}" ${String(value) === option[0] ? 'selected' : ''}>${escapeHtml(option[1])}</option>`).join('')}</select></div>`;
        const minimum = id.endsWith('Denominator') ? '0.000000001' : '0';
        return `<div><label for="gri-metric-${id}" class="text-sm font-medium">${escapeHtml(label)}</label><div class="relative"><input id="gri-metric-${id}" type="${type === 'text' ? 'text' : 'number'}" ${type === 'text' ? '' : `min="${minimum}" step="any"`} value="${escapeHtml(value)}" placeholder="${escapeHtml(unit)}" onchange="updateGRIMetric('${id}',this.value)">${type === 'text' ? '' : `<span class="pointer-events-none absolute right-3 top-1/2 translate-y-[-35%] text-xs text-slate-400">${escapeHtml(unit)}</span>`}</div></div>`;
    }

    function renderMetrics() {
        const rootElement = document.getElementById('gri-metrics-root');
        if (!rootElement) return;
        const state = ensureGRIState();
        const calculation = GRIMetrics.calculate(state.metrics);
        const category = GRIMetrics.categories.find(item => item.id === state.metricCategory) || GRIMetrics.categories[0];
        rootElement.innerHTML = `
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6"><div><h2 class="text-3xl font-extrabold text-slate-800 dark:text-white">GRI Metrics and Calculations</h2><p class="text-sm text-slate-500 mt-1">Enter absolute values, denominators, boundaries and methods. Blank values stay unavailable rather than becoming zero.</p></div><div class="text-xs text-slate-500 lg:text-right">Saved automatically to ${escapeHtml(currentProject().currentFY)}</div></div>
            ${currentProject().demo ? '<div class="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"><strong>Demo values are active.</strong> Replace them with verified reporting data before export.</div>' : ''}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">${GRIMetrics.categories.map(item => `<button type="button" onclick="updateGRIMetricCategory('${item.id}')" class="rounded-xl border px-4 py-3 text-left transition ${item.id === category.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}"><i class="fa-solid ${item.icon} mr-2"></i><strong>${escapeHtml(item.label)}</strong></button>`).join('')}</div>
            ${calculation.errors.length ? `<div class="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"><strong>Fix these metric inputs</strong><ul class="list-disc pl-5 mt-2">${calculation.errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul></div>` : ''}
            <div class="space-y-5">${category.groups.map(group => {
                const results = Object.values(calculation.results).filter(result => result.group === group.id);
                return `<details ${state.metricOpenGroups[category.id] === group.id ? 'open' : ''} class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"><summary onclick="updateGRIMetricOpenGroup('${category.id}','${group.id}')" class="cursor-pointer p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><h3 class="text-lg font-bold">${escapeHtml(group.title)}</h3><p class="text-xs text-slate-500 mt-1">${escapeHtml(group.standards)}</p></div><span class="text-xs font-semibold text-blue-600 dark:text-blue-400">${results.length} calculated</span></summary><div class="border-t border-slate-200 dark:border-slate-700 p-5"><div class="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300 mb-5"><strong>Calculation basis:</strong> ${escapeHtml(group.formula)}</div><div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">${group.fields.map(field => metricInput(field, state.metrics)).join('')}</div><div class="mt-5"><h4 class="text-sm font-bold mb-3">Calculated outputs</h4>${results.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">${results.map(result => `<div class="rounded-lg border ${result.error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'} p-4"><div class="text-xs text-slate-500">${escapeHtml(result.label)}</div><div class="text-xl font-bold mt-1">${escapeHtml(formatMetric(result, 4))}</div><div class="text-xs text-slate-500 mt-2">${escapeHtml(result.formula)}</div></div>`).join('')}</div>` : '<div class="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">Complete the related inputs to calculate this group.</div>'}</div></div></details>`;
            }).join('')}</div>${referenceFooter()}`;
    }

    function renderSetup() {
        const rootElement = document.getElementById('gri-setup-root');
        if (!rootElement) return;
        const state = ensureGRIState();
        const warnings = validateVersions();
        rootElement.innerHTML = `
            <h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">GRI Reporting Setup</h2>
            ${warnings.length ? `<div class="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"><strong>Fix reporting dates or standard editions</strong><ul class="list-disc pl-5 mt-2">${warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></div>` : ''}
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5 space-y-4">
                    <h3 class="font-bold text-lg">Reporting basis</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label class="text-sm">Reporting period start</label><input type="date" value="${escapeHtml(state.profile.reportingStart)}" onchange="updateGRIProfile('reportingStart', this.value)"></div><div><label class="text-sm">Reporting period end</label><input type="date" value="${escapeHtml(state.profile.reportingEnd)}" onchange="updateGRIProfile('reportingEnd', this.value)"></div></div>
                    <div><label class="text-sm">Publication date</label><input type="date" value="${escapeHtml(state.profile.publicationDate)}" onchange="updateGRIProfile('publicationDate', this.value)"></div>
                    <div><label class="text-sm">Applicable Sector Standard</label><select onchange="updateGRIProfile('sector', this.value)"><option value="undetermined" ${state.profile.sector === 'undetermined' ? 'selected' : ''}>Review not completed</option><option value="not_applicable" ${state.profile.sector === 'not_applicable' ? 'selected' : ''}>No available Sector Standard applies</option><option value="gri14" ${state.profile.sector === 'gri14' ? 'selected' : ''}>GRI 14: Mining Sector 2024 V1.1</option></select></div>
                    ${state.profile.sector === 'not_applicable' ? `<div><label class="text-sm">Sector applicability rationale</label><textarea rows="2" class="std-input text-sm" onchange="updateGRIProfile('sectorRationale', this.value)">${escapeHtml(state.profile.sectorRationale)}</textarea><small class="text-slate-500">Document the sectors reviewed and why no published Sector Standard applies.</small></div>` : ''}
                    <label class="flex items-start gap-3 text-sm"><input type="checkbox" class="mt-1" ${state.profile.earlyAdoption ? 'checked' : ''} onchange="updateGRIProfile('earlyAdoption', this.checked)"><span>Documented early adoption applies where a selected standard is not yet effective.</span></label>
                    <label class="flex items-start gap-3 text-sm"><input type="checkbox" class="mt-1" ${state.profile.materialityProcessConfirmed ? 'checked' : ''} onchange="updateGRIProfile('materialityProcessConfirmed', this.checked)"><span>The impact-identification, significance assessment, stakeholder/expert review, and approval process is documented.</span></label>
                    <label class="flex items-start gap-3 text-sm"><input type="checkbox" class="mt-1" ${state.profile.reportingPrinciplesConfirmed ? 'checked' : ''} onchange="updateGRIProfile('reportingPrinciplesConfirmed', this.checked)"><span>Reporting principles have been reviewed and evidenced.</span></label>
                    <label class="flex items-start gap-3 text-sm"><input type="checkbox" class="mt-1" ${state.profile.statementConfirmed ? 'checked' : ''} onchange="updateGRIProfile('statementConfirmed', this.checked)"><span>The exact statement of use has been reviewed and approved.</span></label>
                    <div><label class="text-sm">GRI notification status</label><select onchange="updateGRIProfile('notificationStatus', this.value)"><option value="not_verified" ${state.profile.notificationStatus === 'not_verified' ? 'selected' : ''}>Not verified</option><option value="planned" ${state.profile.notificationStatus === 'planned' ? 'selected' : ''}>Planned</option><option value="verified" ${state.profile.notificationStatus === 'verified' ? 'selected' : ''}>Verified</option></select></div>
                    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"><label class="flex items-start gap-3"><input type="checkbox" class="mt-1" ${state.useEvidenceRelevance ? 'checked' : ''} onchange="toggleEvidenceRelevance(this.checked)"><span><strong>Use optional evidence-relevance factor</strong><br>This internal factor is not prescribed by GRI and never changes the nine-gate compliance result.</span></label></div>
                </div>
                <div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5">
                    <h3 class="font-bold text-lg mb-4">Standards in this report</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[36rem] overflow-y-auto pr-2">${GRIData.standards.map(standard => `<label class="flex items-start gap-2 rounded border border-slate-200 dark:border-slate-700 p-3 text-sm ${standard.universal ? 'opacity-80' : ''}"><input type="checkbox" class="mt-1" ${state.selectedStandards[standard.id] ? 'checked' : ''} ${standard.universal ? 'disabled' : ''} onchange="toggleGRIStandard('${standard.id}', this.checked)"><span>${escapeHtml(standard.title)}<small class="block text-slate-500 mt-1">Effective ${escapeHtml(standard.effectiveFrom)}</small></span></label>`).join('')}</div>
                </div>
            </div>
            <div class="mt-6 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5"><h3 class="font-bold text-lg mb-2">Internal readiness configuration</h3><p class="text-sm text-slate-500 mb-2">These weights and omission defaults are internal controls, not GRI requirements. Lock and version them for each reporting cycle.</p><p class="text-xs text-slate-500 mb-4">When assigning Q, use the documented quality breakup: source evidence 25%, boundary completeness 20%, method transparency 20%, consistency 15%, review and controls 10%, and timeliness 10%.</p><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div><label class="text-xs">Universal weight</label><input type="number" min="0.01" step="0.05" value="${state.weights.universal}" onchange="updateGRIWeight('universal',this.value)"></div><div><label class="text-xs">Crucial weight</label><input type="number" min="0.01" step="0.05" value="${state.weights.crucial}" onchange="updateGRIWeight('crucial',this.value)"></div><div><label class="text-xs">Significant weight</label><input type="number" min="0.01" step="0.05" value="${state.weights.significant}" onchange="updateGRIWeight('significant',this.value)"></div><div><label class="text-xs">Low weight</label><input type="number" min="0.01" step="0.05" value="${state.weights.low}" onchange="updateGRIWeight('low',this.value)"></div><div><label class="text-xs">Legal prohibition C</label><input type="number" min="0" max="1" step="0.05" value="${state.weights.legalProhibition}" onchange="updateGRIWeight('legalProhibition',this.value)"></div><div><label class="text-xs">Confidentiality C</label><input type="number" min="0" max="1" step="0.05" value="${state.weights.confidentiality}" onchange="updateGRIWeight('confidentiality',this.value)"></div><div><label class="text-xs">Unavailable C</label><input type="number" min="0" max="1" step="0.05" value="${state.weights.unavailable}" onchange="updateGRIWeight('unavailable',this.value)"></div></div></div>
            `;
    }

    function topicManagementEditor(topic, record, custom) {
        const call = (field, value, deferRender = false) => `updateGRITopic(${inlineArgument(topic.id)},'${field}',${value},${custom},${deferRender})`;
        if (!custom && record.decision === 'review') return '<div class="text-sm text-slate-500 md:col-span-9">Complete the documented review before deciding whether this topic is material.</div>';
        if (!custom && record.decision === 'not_material') return `<div class="md:col-span-9"><label class="text-xs">Why this Sector topic is not material</label><textarea rows="2" class="std-input text-sm" onchange="${call('explanation', 'this.value')}">${escapeHtml(record.explanation)}</textarea><small class="text-slate-500">Enter the assessed impacts and reason; do not use only “not applicable.”</small></div>`;
        return `<div class="md:col-span-9 space-y-3"><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><div><label class="text-xs">3-3 status</label><select onchange="${call('status', 'this.value')}"><option value="not_assessed" ${record.status === 'not_assessed' ? 'selected' : ''}>Not assessed</option><option value="complete" ${record.status === 'complete' ? 'selected' : ''}>Complete</option><option value="partial" ${record.status === 'partial' ? 'selected' : ''}>Partial</option><option value="missing" ${record.status === 'missing' ? 'selected' : ''}>Missing</option><option value="omitted" ${record.status === 'omitted' ? 'selected' : ''}>Omitted</option></select></div><div><label class="text-xs">Priority</label><select onchange="${call('priority', 'this.value')}"><option value="crucial" ${record.priority === 'crucial' ? 'selected' : ''}>Crucial</option><option value="significant" ${record.priority === 'significant' ? 'selected' : ''}>Significant</option><option value="low" ${record.priority === 'low' ? 'selected' : ''}>Low</option></select></div><div><label class="text-xs">Report location</label><input type="text" class="std-input" value="${escapeHtml(record.managementLocation)}" onchange="${call('managementLocation', 'this.value')}"></div></div><div><label class="text-xs">Disclosure 3-3 management response</label><textarea rows="3" class="std-input text-sm" onchange="${call('management', 'this.value')}">${escapeHtml(record.management)}</textarea></div><div><label class="text-xs">Alternative disclosure rationale</label><textarea rows="2" class="std-input text-sm" onchange="${call('alternativeDisclosures', 'this.value')}">${escapeHtml(record.alternativeDisclosures)}</textarea><small class="text-slate-500">Use only when no GRI Topic Standard disclosure applies; identify the other appropriate disclosure and why it addresses this topic.</small></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><div><label class="text-xs">Completeness C: ${Number(record.completeness).toFixed(2)}</label><input type="range" min="0" max="1" step="0.05" value="${record.completeness}" oninput="this.previousElementSibling.textContent='Completeness C: '+Number(this.value).toFixed(2);${call('completeness', 'this.value', true)}" onchange="${call('completeness', 'this.value')}"></div><div><label class="text-xs">Quality Q: ${Number(record.quality).toFixed(2)}</label><input type="range" min="0" max="1" step="0.05" value="${record.quality}" oninput="this.previousElementSibling.textContent='Quality Q: '+Number(this.value).toFixed(2);${call('quality', 'this.value', true)}" onchange="${call('quality', 'this.value')}"></div><div><label class="text-xs">Evidence relevance E</label><select onchange="${call('evidenceRelevance', 'this.value')}"><option value="1" ${Number(record.evidenceRelevance) === 1 ? 'selected' : ''}>1.00 Direct</option><option value="0.75" ${Number(record.evidenceRelevance) === .75 ? 'selected' : ''}>0.75 Fragmented</option><option value="0.5" ${Number(record.evidenceRelevance) === .5 ? 'selected' : ''}>0.50 Generic</option><option value="0" ${Number(record.evidenceRelevance) === 0 ? 'selected' : ''}>0.00 Absent</option></select><small class="text-slate-500">Optional; not prescribed by GRI.</small></div></div>${record.status === 'omitted' ? omissionEditor(topic.id, record, '3-3', custom) : ''}</div>`;
    }

    function omissionEditor(id, record, disclosureId, custom = false) {
        const updater = custom === null
            ? field => `updateGRIDisclosure(${inlineArgument(id)},'${field}',this.value)`
            : field => `updateGRITopic(${inlineArgument(id)},'${field}',this.value,${custom})`;
        const prohibited = omissionProhibited.has(disclosureId);
        if (prohibited) return '<div class="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">Change the status from Omitted and complete this disclosure; GRI 1 does not permit its omission.</div>';
        return `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-3"><div><label class="text-xs">Permitted omission reason</label><select onchange="${updater('omissionReason')}"><option value="">Select reason</option>${Object.entries(omissionReasons).map(([value,label]) => `<option value="${value}" ${record.omissionReason === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select></div><div><label class="text-xs">Required explanation</label><textarea rows="2" class="std-input" onchange="${updater('omissionExplanation')}">${escapeHtml(record.omissionExplanation)}</textarea></div>${record.omissionReason === 'unavailable' ? `<div><label class="text-xs">Steps being taken</label><textarea rows="2" class="std-input" onchange="${updater('omissionSteps')}">${escapeHtml(record.omissionSteps)}</textarea></div><div><label class="text-xs">Expected timeframe</label><input type="text" class="std-input" value="${escapeHtml(record.omissionTimeframe)}" onchange="${updater('omissionTimeframe')}"></div>` : ''}</div>`;
    }

    function renderMateriality() {
        const rootElement = document.getElementById('gri-materiality-root');
        if (!rootElement) return;
        const state = ensureGRIState();
        const sectorSection = state.profile.sector === 'gri14' ? `<div class="mb-8"><div class="mb-4"><h3 class="text-xl font-bold">GRI 14 likely material topics</h3><p class="text-sm text-slate-500 mt-1">Every Sector topic must be reviewed. Each material topic needs its own Disclosure 3-3 response and location.</p></div><div class="space-y-3">${GRIData.sector14Topics.map(topic => {
            const record = state.topics[topic.id];
            return `<div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4"><div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start"><div class="md:col-span-3"><strong>${topic.id} ${escapeHtml(topic.title)}</strong><div class="text-xs text-slate-500 mt-1">GRI 14: Mining Sector 2024 V1.1</div></div><div class="md:col-span-9"><select onchange="updateGRITopic('${topic.id}','decision',this.value,false)"><option value="review" ${record.decision === 'review' ? 'selected' : ''}>Review required</option><option value="material" ${record.decision === 'material' ? 'selected' : ''}>Material</option><option value="not_material" ${record.decision === 'not_material' ? 'selected' : ''}>Not material</option></select></div>${topicManagementEditor(topic, record, false)}</div></div>`;
        }).join('')}</div></div>` : `<div class="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-5 mb-8">${state.profile.sector === 'not_applicable' ? 'No Sector Standard is marked applicable. Retain the documented applicability rationale in Reporting Setup.' : 'Complete the Sector Standard applicability review in Reporting Setup.'}</div>`;
        const customSection = `<div><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h3 class="text-xl font-bold">Organization-defined material topics</h3><p class="text-sm text-slate-500 mt-1">Use these records for material topics not represented by a selected Sector topic.</p></div><button type="button" onclick="addGRICustomTopic()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Add topic</button></div><div class="space-y-3">${state.customTopics.map(topic => `<div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4"><div class="flex flex-col sm:flex-row gap-3 mb-3"><input type="text" class="std-input flex-1" value="${escapeHtml(topic.title)}" placeholder="Material topic name" onchange="updateGRITopic(${inlineArgument(topic.id)},'title',this.value,true)"><button type="button" onclick="removeGRICustomTopic(${inlineArgument(topic.id)})" class="text-red-600 px-3 py-2">Remove</button></div><div class="grid grid-cols-1 md:grid-cols-12 gap-3">${topicManagementEditor(topic, topic, true)}</div></div>`).join('') || '<div class="p-5 border border-dashed rounded text-sm text-slate-500">No organization-defined topics added.</div>'}</div></div>`;
        const recommendations = state.profile.sector === 'gri14' ? `<div class="mt-8"><h3 class="text-xl font-bold">Optional GRI 14 sector disclosures</h3><p class="text-sm text-slate-500 mt-1 mb-4">These recommended additional sector disclosures are tracked separately and do not affect the nine compliance gates or readiness score.</p><div class="space-y-3">${GRIData.sector14Recommendations.map(item => { const record = state.recommendations[item.id]; return `<details class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl"><summary class="p-4 cursor-pointer"><span class="font-mono text-blue-600 mr-2">${item.id}</span><strong>${escapeHtml(item.title)}</strong><span class="ml-2 text-xs text-slate-500">${escapeHtml(record.status.replace('_', ' '))}</span></summary><div class="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3"><div class="text-sm">${escapeHtml(item.requirement)}</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label class="text-xs">Tracking status</label><select onchange="updateGRIRecommendation('${item.id}','status',this.value)"><option value="not_assessed" ${record.status === 'not_assessed' ? 'selected' : ''}>Not assessed</option><option value="planned" ${record.status === 'planned' ? 'selected' : ''}>Planned</option><option value="reported" ${record.status === 'reported' ? 'selected' : ''}>Reported</option><option value="not_planned" ${record.status === 'not_planned' ? 'selected' : ''}>Not planned</option></select></div><div><label class="text-xs">Location</label><input type="text" class="std-input" value="${escapeHtml(record.location)}" onchange="updateGRIRecommendation('${item.id}','location',this.value)"></div></div><div><label class="text-xs">Response or implementation note</label><textarea rows="2" class="std-input" onchange="updateGRIRecommendation('${item.id}','response',this.value)">${escapeHtml(record.response)}</textarea></div></div></details>`; }).join('')}</div></div>` : '';
        rootElement.innerHTML = `<h2 class="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Material Topics and Disclosure 3-3</h2>${sectorSection}${customSection}${recommendations}`;
    }

    function disclosureMatchesFilter(disclosure) {
        const state = ensureGRIState();
        const record = state.disclosures[disclosure.key];
        const search = state.filters.search.toLowerCase();
        const standard = standardByTitle(disclosure.standard);
        if (state.filters.standard !== 'all' && standard.id !== state.filters.standard) return false;
        if (state.filters.status !== 'all' && record.status !== state.filters.status) return false;
        if (state.filters.group !== 'all' && disclosure.group !== state.filters.group) return false;
        return !search || `${disclosure.id} ${disclosure.title} ${disclosure.standard}`.toLowerCase().includes(search);
    }

    function disclosureCard(disclosure) {
        const state = ensureGRIState();
        const record = state.disclosures[disclosure.key];
        const weight = disclosureWeight(record);
        const score = ESGCalculations.disclosureReadiness(record.completeness, record.quality, record.evidenceRelevance, state.useEvidenceRelevance);
        const expectedRefs = sectorReferences(disclosure);
        const shared = sharedFactSummary(disclosure.key);
        return `<details class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"><summary class="cursor-pointer p-4 flex flex-col sm:flex-row sm:items-center gap-2 justify-between"><div><span class="font-mono text-blue-600 dark:text-blue-400 mr-2">${escapeHtml(disclosure.id)}</span><strong>${escapeHtml(disclosure.title)}</strong><div class="text-xs text-slate-500 mt-1">${escapeHtml(disclosure.standard)}</div></div><div class="flex items-center gap-2"><span class="text-xs rounded-full px-2 py-1 bg-slate-100 dark:bg-slate-700">${escapeHtml(record.status.replace('_',' '))}</span><span class="font-mono font-bold">${score.toFixed(1)}</span></div></summary><div class="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4"><div class="rounded bg-slate-50 dark:bg-slate-900 p-3 text-sm"><strong>Requirement summary:</strong> ${escapeHtml(disclosure.requirement)}</div>${shared ? `<div class="rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3 text-xs"><strong>Shared BRSR fields:</strong> ${escapeHtml(shared)}<br><span class="text-slate-500">Shared values are inputs only; they do not prove that every GRI requirement is complete.</span></div>` : ''}<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"><div><label class="text-xs">Index applicability</label><select onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','applicability',this.value)"><option value="not_selected" ${record.applicability === 'not_selected' ? 'selected' : ''}>Not selected</option><option value="applicable" ${record.applicability === 'applicable' ? 'selected' : ''}>Include in index</option></select></div><div><label class="text-xs">Status</label><select onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','status',this.value)"><option value="not_assessed" ${record.status === 'not_assessed' ? 'selected' : ''}>Not assessed</option><option value="complete" ${record.status === 'complete' ? 'selected' : ''}>Complete</option><option value="partial" ${record.status === 'partial' ? 'selected' : ''}>Partial</option><option value="missing" ${record.status === 'missing' ? 'selected' : ''}>Missing</option><option value="omitted" ${record.status === 'omitted' ? 'selected' : ''}>Omitted</option></select></div><div><label class="text-xs">Materiality</label><select onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','materiality',this.value)" ${disclosure.group === 'Universal' ? 'disabled' : ''}><option value="universal" ${record.materiality === 'universal' ? 'selected' : ''}>Universal</option><option value="crucial" ${record.materiality === 'crucial' ? 'selected' : ''}>Crucial</option><option value="significant" ${record.materiality === 'significant' ? 'selected' : ''}>Significant</option><option value="low" ${record.materiality === 'low' ? 'selected' : ''}>Low</option></select></div><div><label class="text-xs">Material topic IDs</label><input type="text" class="std-input" value="${escapeHtml(record.materialTopicIds)}" placeholder="e.g. 14.7, M6" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','materialTopicIds',this.value)"></div></div><div><label class="text-xs">Disclosure response and requirement notes</label><textarea rows="3" class="std-input text-sm" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','response',this.value)">${escapeHtml(record.response)}</textarea></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"><div><label class="text-xs">Printed page</label><input type="text" class="std-input" value="${escapeHtml(record.printedPage)}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','printedPage',this.value)"></div><div><label class="text-xs">PDF page</label><input type="text" class="std-input" value="${escapeHtml(record.pdfPage)}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','pdfPage',this.value)"></div><div><label class="text-xs">Evidence reference or URL</label><input type="text" class="std-input" value="${escapeHtml(record.evidenceReference)}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','evidenceReference',this.value)"></div><div><label class="text-xs">GRI Sector reference</label><input type="text" class="std-input" value="${escapeHtml(record.sectorReference)}" placeholder="${escapeHtml(expectedRefs.join(', '))}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','sectorReference',this.value)"></div></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><div><label class="text-xs">Boundary</label><input type="text" class="std-input" value="${escapeHtml(record.boundary)}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','boundary',this.value)"></div><div><label class="text-xs">Method, units, factors, and denominator</label><input type="text" class="std-input" value="${escapeHtml(record.methodology)}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','methodology',this.value)"></div><div><label class="text-xs">Assurance level, provider, and scope</label><input type="text" class="std-input" value="${escapeHtml(record.assuranceScope)}" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','assuranceScope',this.value)"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"><div><label class="text-xs">Completeness C: ${Number(record.completeness).toFixed(2)}</label><input type="range" min="0" max="1" step="0.05" value="${record.completeness}" oninput="this.previousElementSibling.textContent='Completeness C: '+Number(this.value).toFixed(2);updateGRIDisclosure('${escapeHtml(disclosure.key)}','completeness',this.value,true)" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','completeness',this.value)"></div><div><label class="text-xs">Quality Q: ${Number(record.quality).toFixed(2)}</label><input type="range" min="0" max="1" step="0.05" value="${record.quality}" oninput="this.previousElementSibling.textContent='Quality Q: '+Number(this.value).toFixed(2);updateGRIDisclosure('${escapeHtml(disclosure.key)}','quality',this.value,true)" onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','quality',this.value)"></div><div><label class="text-xs">Evidence relevance E</label><select onchange="updateGRIDisclosure('${escapeHtml(disclosure.key)}','evidenceRelevance',this.value)"><option value="1" ${Number(record.evidenceRelevance) === 1 ? 'selected' : ''}>1.00 Direct</option><option value="0.75" ${Number(record.evidenceRelevance) === .75 ? 'selected' : ''}>0.75 Fragmented</option><option value="0.5" ${Number(record.evidenceRelevance) === .5 ? 'selected' : ''}>0.50 Generic</option><option value="0" ${Number(record.evidenceRelevance) === 0 ? 'selected' : ''}>0.00 Absent</option></select><small class="text-slate-500">Optional; not prescribed by GRI.</small></div><div class="rounded bg-slate-50 dark:bg-slate-900 p-3"><div class="text-xs">Weight</div><div class="font-mono font-bold">${weight.toFixed(2)}</div><div class="text-xs mt-2">Readiness</div><div class="font-mono font-bold text-blue-600">${score.toFixed(1)}</div></div></div>${record.status === 'omitted' ? omissionEditor(disclosure.key, record, disclosure.id, null) : ''}</div></details>`;
    }

    function renderDisclosures() {
        const rootElement = document.getElementById('gri-disclosures-root');
        if (!rootElement) return;
        const openIndexes = [...rootElement.querySelectorAll('details')].map((element, index) => element.open ? index : -1).filter(index => index >= 0);
        const state = ensureGRIState();
        const rows = selectedDisclosures().filter(disclosureMatchesFilter);
        rootElement.innerHTML = `<div class="mb-6"><h2 class="text-3xl font-extrabold text-slate-800 dark:text-white">GRI Disclosure Register</h2><p class="text-sm text-slate-500 mt-1">Complete the response, location and evidence; a citation alone does not complete a disclosure.</p></div><div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"><input type="search" class="std-input" placeholder="Search ID, title, or standard" value="${escapeHtml(state.filters.search)}" oninput="updateGRIFilter('search',this.value)"><select onchange="updateGRIFilter('group',this.value)"><option value="all">All reporting categories</option>${['Universal','Economic','Environmental','Social'].map(group => `<option value="${group}" ${state.filters.group === group ? 'selected' : ''}>${group}</option>`).join('')}</select><select onchange="updateGRIFilter('standard',this.value)"><option value="all">All selected standards</option>${GRIData.standards.filter(standard => state.selectedStandards[standard.id]).map(standard => `<option value="${standard.id}" ${state.filters.standard === standard.id ? 'selected' : ''}>${escapeHtml(standard.title)}</option>`).join('')}</select><select onchange="updateGRIFilter('status',this.value)"><option value="all">All statuses</option>${['not_assessed','complete','partial','missing','omitted'].map(status => `<option value="${status}" ${state.filters.status === status ? 'selected' : ''}>${status.replace('_',' ')}</option>`).join('')}</select></div><div class="text-sm text-slate-500 mb-3">Showing ${rows.length} of ${selectedDisclosures().length} disclosures</div><div class="space-y-3">${rows.map(disclosureCard).join('') || '<div class="p-6 text-center border border-dashed rounded text-slate-500">Change or clear the filters to show disclosures.</div>'}</div>${referenceFooter()}`;
        const details = rootElement.querySelectorAll('details');
        openIndexes.forEach(index => { if (details[index]) details[index].open = true; });
    }

    function contentIndexRows() {
        const state = ensureGRIState();
        return selectedDisclosures().filter(disclosure => state.disclosures[disclosure.key].applicability === 'applicable');
    }

    function omissionText(record) {
        if (record.status !== 'omitted') return '';
        return [omissionReasons[record.omissionReason] || 'Select a permitted omission reason', record.omissionExplanation, record.omissionSteps && `Steps: ${record.omissionSteps}`, record.omissionTimeframe && `Timeframe: ${record.omissionTimeframe}`].filter(Boolean).join('; ');
    }

    function reportingPeriod() {
        const profile = ensureGRIState().profile;
        return profile.reportingStart && profile.reportingEnd ? `${profile.reportingStart} to ${profile.reportingEnd}` : 'reporting period not set';
    }

    function statementOfUse() {
        const project = currentProject();
        return `${project.meta.name || project.name} has reported in accordance with the GRI Standards for the period ${reportingPeriod()}.`;
    }

    function renderContentIndex() {
        const rootElement = document.getElementById('gri-index-root');
        if (!rootElement) return;
        const state = ensureGRIState();
        const rows = contentIndexRows();
        const materialTopics = activeMaterialTopics();
        const compliant = evaluateGates().every(gate => gate[2]);
        const statement = compliant ? statementOfUse() : 'Complete all nine readiness actions before using the GRI in-accordance statement.';
        const topicRows = materialTopics.map(topic => `<tr class="border-t border-slate-200 dark:border-slate-700 align-top"><td class="p-3 text-sm">GRI 3: Material Topics 2021</td><td class="p-3 text-sm"><strong>3-3</strong> ${escapeHtml(topic.id)} ${escapeHtml(topic.title)}</td><td class="p-3 text-sm">${escapeHtml(topic.record.managementLocation || 'Missing')}</td><td class="p-3 text-sm">${escapeHtml(omissionText(topic.record))}</td><td class="p-3 text-sm">${topic.sector ? escapeHtml(`${topic.id}.1`) : ''}</td></tr>`).join('');
        rootElement.innerHTML = `<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6"><div><h2 class="text-3xl font-extrabold text-slate-800 dark:text-white">GRI Content Index Preview</h2><p class="text-sm text-slate-500 mt-1">Internal readiness scores are excluded from the published index.</p></div><button type="button" onclick="downloadGRIMarkdown()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold">Download Markdown</button></div><div class="rounded-lg ${compliant ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200'} border p-4 text-sm mb-5">${escapeHtml(statement)}</div><div class="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-4 mb-5"><h3 class="font-bold mb-2">Material topics</h3><div class="text-sm">${materialTopics.map(topic => `${escapeHtml(topic.id)} ${escapeHtml(topic.title)}`).join('<br>') || 'Add or select at least one material topic.'}</div></div><div class="overflow-x-auto bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl"><table class="w-full text-left min-w-[900px]"><thead class="bg-slate-100 dark:bg-slate-900"><tr><th class="p-3">Standard</th><th class="p-3">Disclosure</th><th class="p-3">Location</th><th class="p-3">Omission</th><th class="p-3">Sector ref.</th></tr></thead><tbody>${topicRows}${rows.map(disclosure => { const record = state.disclosures[disclosure.key]; const location = [record.printedPage && `Printed ${record.printedPage}`, record.pdfPage && `PDF ${record.pdfPage}`, record.evidenceReference].filter(Boolean).join('; '); return `<tr class="border-t border-slate-200 dark:border-slate-700 align-top"><td class="p-3 text-sm">${escapeHtml(disclosure.standard)}</td><td class="p-3 text-sm"><strong>${escapeHtml(disclosure.id)}</strong> ${escapeHtml(disclosure.title)}${record.materialTopicIds ? `<div class="text-xs text-slate-500 mt-1">Topics: ${escapeHtml(record.materialTopicIds)}</div>` : ''}</td><td class="p-3 text-sm">${escapeHtml(location || 'Add a report location')}</td><td class="p-3 text-sm">${escapeHtml(omissionText(record))}</td><td class="p-3 text-sm">${escapeHtml(record.sectorReference)}</td></tr>`; }).join('')}</tbody></table></div>`;
    }

    function renderGRI() {
        ensureGRIState();
        renderOverview();
        renderMetrics();
        renderSetup();
        renderMateriality();
        renderDisclosures();
        renderContentIndex();
    }

    function renderGRITab(tabId) {
        const renderers = {
            'tab-gri-overview': renderOverview,
            'tab-gri-metrics': renderMetrics,
            'tab-gri-setup': renderSetup,
            'tab-gri-materiality': renderMateriality,
            'tab-gri-disclosures': renderDisclosures,
            'tab-gri-index': renderContentIndex
        };
        if (renderers[tabId]) renderers[tabId]();
    }

    function refreshGRISharedViews() {
        const project = currentProject();
        if (!project || project.framework !== 'gri') return;
        renderGRITab(currentTab);
    }

    function switchFramework(framework) {
        const project = currentProject();
        if (!project) return;
        clearValidationSummary();
        saveDOMToFY();
        project.framework = framework;
        saveAll();
        applyFrameworkUI();
        if (typeof trackEvent === 'function') trackEvent('framework_switched', { framework });
    }

    function applyFrameworkUI() {
        const project = currentProject();
        const framework = project && project.framework === 'gri' ? 'gri' : 'brsr';
        document.querySelectorAll('.brsr-nav-item').forEach(element => element.classList.toggle('hidden', framework !== 'brsr'));
        document.querySelectorAll('.gri-nav-item').forEach(element => element.classList.toggle('hidden', framework !== 'gri'));
        ['brsr','gri'].forEach(value => {
            const button = document.getElementById(`framework-${value}`);
            const active = value === framework;
            button.className = `framework-button rounded px-3 py-2 text-xs font-bold ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`;
        });
        const activeTab = document.querySelector('.tab-content.active');
        const validTab = activeTab?.classList.contains('shared-tab') || (framework === 'gri' ? activeTab?.classList.contains('gri-tab') : activeTab && !activeTab.classList.contains('gri-tab'));
        if (!validTab) openTab(framework === 'gri' ? 'tab-gri-overview' : 'tab-dashboard');
        else if (framework === 'gri' && activeTab?.classList.contains('gri-tab')) renderGRITab(activeTab.id);
    }

    function updateGRIProfile(field, value) {
        const state = ensureGRIState();
        const previousSector = state.profile.sector;
        state.profile[field] = value;
        if (field === 'sector' && value === 'gri14') {
            GRIData.sector14Topics.filter(topic => state.topics[topic.id].decision === 'material').forEach(topic => selectSectorDisclosures(topic.id));
        }
        if (field === 'sector' && previousSector === 'gri14' && value !== 'gri14') removeMaterialTopicLinks(new Set(GRIData.sector14Topics.map(topic => topic.id)));
        saveAll();
        renderGRITab(currentTab);
        trackGRI('gri_profile_updated', { field_id: field });
    }

    function toggleEvidenceRelevance(value) {
        const state = ensureGRIState();
        state.useEvidenceRelevance = Boolean(value);
        saveAll();
        renderGRITab(currentTab);
        trackGRI('gri_evidence_factor_toggled', { field_id: 'useEvidenceRelevance' });
    }

    function updateGRIMetricCategory(category) {
        const state = ensureGRIState();
        if (!GRIMetrics.categories.some(item => item.id === category)) return;
        state.metricCategory = category;
        saveAll();
        renderMetrics();
        trackGRI('gri_metric_category_selected', { type: category });
    }

    function updateGRIMetricOpenGroup(category, group) {
        const state = ensureGRIState();
        const categoryRecord = GRIMetrics.categories.find(item => item.id === category);
        if (!categoryRecord || !categoryRecord.groups.some(item => item.id === group)) return;
        state.metricOpenGroups[category] = group;
        saveAll();
        trackGRI('gri_metric_group_toggled', { type: group });
    }

    function updateGRIMetric(field, value) {
        const state = ensureGRIState();
        if (!Object.prototype.hasOwnProperty.call(state.metrics, field)) return;
        state.metrics[field] = value;
        saveAll();
        renderMetrics();
        trackGRI('gri_metric_updated', { field_id: field });
    }

    function updateGRIWeight(field, value) {
        const state = ensureGRIState();
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return;
        state.weights[field] = ['legalProhibition', 'confidentiality', 'unavailable'].includes(field) ? Math.min(1, Math.max(0, parsed)) : Math.max(0.01, parsed);
        const reason = { legalProhibition: 'legal_prohibition', confidentiality: 'confidentiality', unavailable: 'unavailable' }[field];
        if (reason) {
            Object.values(state.disclosures).filter(record => record.status === 'omitted' && record.omissionReason === reason).forEach(record => { record.completeness = state.weights[field]; });
            GRIData.sector14Topics.map(topic => state.topics[topic.id]).concat(state.customTopics).filter(record => record.status === 'omitted' && record.omissionReason === reason).forEach(record => { record.completeness = state.weights[field]; });
        }
        saveAll();
        renderGRITab(currentTab);
        trackGRI('gri_weight_updated', { field_id: field });
    }

    function omissionCompletion(reason) {
        const weights = ensureGRIState().weights;
        return { not_applicable: 0, legal_prohibition: weights.legalProhibition, confidentiality: weights.confidentiality, unavailable: weights.unavailable }[reason];
    }

    function toggleGRIStandard(id, selected) {
        const state = ensureGRIState();
        state.selectedStandards[id] = Boolean(selected);
        const standard = GRIData.standards.find(item => item.id === id);
        if (!standard) return;
        if (!selected) GRIData.disclosures.filter(disclosure => disclosure.standard === standard.title).forEach(disclosure => { state.disclosures[disclosure.key].applicability = 'not_selected'; });
        saveAll();
        renderGRITab(currentTab);
        trackGRI('gri_standard_toggled', { field_id: id });
    }

    function selectSectorDisclosures(topicId) {
        const state = ensureGRIState();
        Object.entries(GRIData.sector14References).filter(([, references]) => references.some(reference => reference.startsWith(`${topicId}.`))).forEach(([key]) => {
            const disclosure = GRIData.disclosures.find(item => item.key === key);
            const standard = disclosure && standardByTitle(disclosure.standard);
            if (standard) state.selectedStandards[standard.id] = true;
            if (state.disclosures[key]) {
                state.disclosures[key].applicability = 'applicable';
                const ids = state.disclosures[key].materialTopicIds.split(',').map(value => value.trim()).filter(Boolean);
                if (!ids.includes(topicId)) ids.push(topicId);
                state.disclosures[key].materialTopicIds = ids.join(', ');
                const references = GRIData.sector14References[key].filter(reference => reference.startsWith(`${topicId}.`));
                const savedReferences = state.disclosures[key].sectorReference.split(/[;,\s]+/).filter(Boolean);
                references.forEach(reference => { if (!savedReferences.includes(reference)) savedReferences.push(reference); });
                state.disclosures[key].sectorReference = savedReferences.join(', ');
            }
        });
    }

    function removeMaterialTopicLinks(topicIds) {
        const state = ensureGRIState();
        Object.entries(state.disclosures).forEach(([key, record]) => {
            const previousTopics = record.materialTopicIds.split(',').map(item => item.trim()).filter(Boolean);
            const retainedTopics = previousTopics.filter(item => !topicIds.has(item));
            record.materialTopicIds = retainedTopics.join(', ');
            const retainedReferences = record.sectorReference.split(/[;,\s]+/).filter(Boolean).filter(reference => ![...topicIds].some(id => reference.startsWith(`${id}.`)));
            record.sectorReference = retainedReferences.join(', ');
            const disclosure = GRIData.disclosures.find(item => item.key === key);
            if (disclosure?.group !== 'Universal' && record.applicability === 'applicable' && previousTopics.some(item => topicIds.has(item)) && retainedTopics.length === 0) record.applicability = 'not_selected';
        });
    }

    function updateGRITopic(id, field, value, custom, deferRender) {
        const state = ensureGRIState();
        const record = custom ? state.customTopics.find(topic => topic.id === id) : state.topics[id];
        if (!record) return;
        if (['completeness', 'quality', 'evidenceRelevance'].includes(field)) value = Number(value);
        record[field] = value;
        if (field === 'decision') {
            if (value === 'material') {
                record.explanation = '';
                selectSectorDisclosures(id);
            }
            if (value === 'not_material') {
                record.management = '';
                Object.entries(state.disclosures).forEach(([key, disclosureRecord]) => {
                    disclosureRecord.materialTopicIds = disclosureRecord.materialTopicIds.split(',').map(item => item.trim()).filter(item => item && item !== id).join(', ');
                    const references = (GRIData.sector14References[key] || []).filter(reference => !reference.startsWith(`${id}.`));
                    const retained = disclosureRecord.sectorReference.split(/[;,\s]+/).filter(reference => references.includes(reference));
                    disclosureRecord.sectorReference = retained.join(', ');
                });
            }
        }
        if (field === 'status') {
            record.completeness = GRIScoring.statusCompleteness(value, record.completeness, omissionCompletion(record.omissionReason));
        }
        if (field === 'omissionReason') {
            const completion = omissionCompletion(value);
            if (completion !== undefined) record.completeness = completion;
        }
        if (deferRender) return;
        saveAll();
        renderMateriality();
        trackGRI('gri_topic_updated', { field_id: field, type: custom ? 'custom' : 'sector' });
    }

    function addGRICustomTopic() {
        const state = ensureGRIState();
        clearValidationSummary();
        state.customTopics.push(defaultTopic(`T${Date.now()}`, '', 'material'));
        saveAll();
        renderMateriality();
        trackGRI('gri_topic_added', { type: 'custom' });
    }

    function removeGRICustomTopic(id) {
        const state = ensureGRIState();
        clearValidationSummary();
        state.customTopics = state.customTopics.filter(topic => topic.id !== id);
        removeMaterialTopicLinks(new Set([id]));
        saveAll();
        renderMateriality();
        trackGRI('gri_topic_removed', { type: 'custom' });
    }

    function updateGRIRecommendation(id, field, value) {
        const state = ensureGRIState();
        if (!state.recommendations[id]) return;
        state.recommendations[id][field] = value;
        saveAll();
        const details = [...document.querySelectorAll('#gri-materiality-root details')].find(element => element.querySelector('summary .font-mono')?.textContent === id);
        const status = details?.querySelector('summary span:last-child');
        if (status) status.textContent = state.recommendations[id].status.replace('_', ' ');
        trackGRI('gri_recommendation_updated', { field_id: field });
    }

    function updateGRIDisclosure(key, field, value, deferRender) {
        const state = ensureGRIState();
        if (!state.disclosures[key]) return;
        if (['completeness','quality','evidenceRelevance'].includes(field)) value = Number(value);
        state.disclosures[key][field] = value;
        if (field === 'status') {
            state.disclosures[key].completeness = GRIScoring.statusCompleteness(value, state.disclosures[key].completeness, omissionCompletion(state.disclosures[key].omissionReason));
        }
        if (field === 'omissionReason') {
            const completion = omissionCompletion(value);
            if (completion !== undefined) state.disclosures[key].completeness = completion;
        }
        if (deferRender) return;
        saveAll();
        if (['status', 'omissionReason'].includes(field)) renderDisclosures();
        const disclosure = GRIData.disclosures.find(item => item.key === key);
        const card = [...document.querySelectorAll('#gri-disclosures-root details')].find(element => {
            const label = element.querySelector('summary .font-mono');
            return label?.textContent === disclosure?.id && element.querySelector('summary')?.textContent.includes(disclosure.standard);
        });
        const score = card?.querySelectorAll('summary .font-mono')[1];
        if (score) score.textContent = ESGCalculations.disclosureReadiness(state.disclosures[key].completeness, state.disclosures[key].quality, state.disclosures[key].evidenceRelevance, state.useEvidenceRelevance).toFixed(1);
        trackGRI('gri_disclosure_updated', { field_id: field });
    }

    let filterTimer;
    function updateGRIFilter(field, value) {
        const state = ensureGRIState();
        state.filters[field] = value;
        saveAll();
        clearTimeout(filterTimer);
        filterTimer = setTimeout(() => {
            const searchInput = document.querySelector('#gri-disclosures-root input[type="search"]');
            const restoreFocus = field === 'search' && document.activeElement === searchInput;
            const selection = restoreFocus ? searchInput.selectionStart : null;
            renderDisclosures();
            if (restoreFocus) {
                const replacement = document.querySelector('#gri-disclosures-root input[type="search"]');
                replacement.focus();
                replacement.setSelectionRange(selection, selection);
            }
            trackGRI('gri_disclosure_filter_updated', { field_id: field });
        }, field === 'search' ? 150 : 0);
    }

    function markdownEscape(value) {
        return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    }

    function buildGRIMarkdown() {
        const state = ensureGRIState();
        const gates = evaluateGates();
        const compliant = gates.every(gate => gate[2]);
        const statement = compliant ? statementOfUse() : 'Draft only: the in-accordance statement is withheld until all nine GRI 1 requirements pass.';
        const sectorTitle = state.profile.sector === 'gri14' ? 'GRI 14: Mining Sector 2024 V1.1' : state.profile.sector === 'not_applicable' ? 'None applicable (review documented)' : 'Applicability not determined';
        const lines = ['# GRI content index', '', `Statement of use: ${statement}`, '', `Reporting period: ${reportingPeriod()}`, `GRI 1 used: GRI 1: Foundation 2021`, `Applicable Sector Standard: ${sectorTitle}`, ''];
        lines.push('## Material topics', '', '| Topic ID | Material topic | Disclosure 3-3 location | Omission |', '|---|---|---|---|');
        activeMaterialTopics().forEach(topic => lines.push(`| ${markdownEscape(topic.id)} | ${markdownEscape(topic.title)} | ${markdownEscape(topic.record.managementLocation)} | ${markdownEscape(omissionText(topic.record))} |`));
        lines.push('');
        if (state.profile.sector === 'gri14') {
            lines.push('## Sector topics determined not material', '', '| Topic | Explanation |', '|---|---|');
            GRIData.sector14Topics.filter(topic => state.topics[topic.id].decision === 'not_material').forEach(topic => lines.push(`| ${topic.id} ${markdownEscape(topic.title)} | ${markdownEscape(state.topics[topic.id].explanation)} |`));
            lines.push('');
            const reportedRecommendations = GRIData.sector14Recommendations.filter(item => state.recommendations[item.id].status === 'reported');
            if (reportedRecommendations.length) {
                lines.push('## Additional sector disclosures', '', '| Sector reference | Disclosure | Location |', '|---|---|---|');
                reportedRecommendations.forEach(item => lines.push(`| ${item.id} | ${markdownEscape(item.title)} | ${markdownEscape(state.recommendations[item.id].location)} |`));
                lines.push('');
            }
        }
        lines.push('## Disclosures', '', '| GRI Standard | Disclosure | Location | Omission | Sector reference |', '|---|---|---|---|---|');
        activeMaterialTopics().forEach(topic => lines.push(`| GRI 3: Material Topics 2021 | 3-3 Management of ${markdownEscape(topic.id)} ${markdownEscape(topic.title)} | ${markdownEscape(topic.record.managementLocation)} | ${markdownEscape(omissionText(topic.record))} | ${topic.sector ? `${topic.id}.1` : ''} |`));
        contentIndexRows().forEach(disclosure => {
            const record = state.disclosures[disclosure.key];
            const location = [record.printedPage && `Printed ${record.printedPage}`, record.pdfPage && `PDF ${record.pdfPage}`, record.evidenceReference].filter(Boolean).join('; ');
            lines.push(`| ${markdownEscape(disclosure.standard)} | ${disclosure.id} ${markdownEscape(disclosure.title)}${record.materialTopicIds ? ` (${markdownEscape(record.materialTopicIds)})` : ''} | ${markdownEscape(location)} | ${markdownEscape(omissionText(record))} | ${markdownEscape(record.sectorReference)} |`);
        });
        return lines.join('\n');
    }

    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function downloadGRIMarkdown() {
        const project = currentProject();
        downloadBlob(buildGRIMarkdown(), `${(project.meta.name || project.name).replace(/[^a-z0-9]+/gi,'_')}_GRI_Content_Index_${project.currentFY}.md`, 'text/markdown;charset=utf-8');
        if (typeof trackEvent === 'function') trackEvent('download_gri_index');
    }

    async function downloadGRIDashboardPDF() {
        if (typeof html2pdf !== 'function') {
            alert('Wait a few seconds, then select Export Dashboard PDF again.');
            return;
        }
        const project = currentProject();
        const state = ensureGRIState();
        const wasDark = document.documentElement.classList.contains('dark');
        const previousAnimation = typeof Chart !== 'undefined' ? Chart.defaults.animation : undefined;
        if (wasDark) document.documentElement.classList.remove('dark');
        if (typeof Chart !== 'undefined') Chart.defaults.animation = false;
        renderOverview();
        const exportElement = document.getElementById('gri-dashboard-export-area');
        const presentation = PDFExport.prepare(exportElement, { width: '2800px', chartHeight: '220px' });
        const captureWidth = exportElement.scrollWidth;
        try {
            renderGRICharts(state, selectedDisclosures().filter(disclosure => state.disclosures[disclosure.key].applicability === 'applicable'));
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            await html2pdf().set({ margin: 0.15, filename: `${(project.meta.name || project.name).replace(/[^a-z0-9]+/gi,'_')}_GRI_Dashboard_${project.currentFY}.pdf`, image: { type: 'jpeg', quality: 0.98 }, pagebreak: { mode: [] }, html2canvas: { scale: 2, useCORS: true, width: captureWidth, windowWidth: captureWidth, logging: false }, jsPDF: { unit: 'in', format: 'a2', orientation: 'landscape' } }).from(exportElement).save();
            if (typeof trackEvent === 'function') trackEvent('download_gri_dashboard');
        } catch (error) {
            alert('The GRI dashboard could not be exported. Check your connection and try again.');
            if (typeof trackEvent === 'function') trackEvent('download_gri_dashboard_failed');
        } finally {
            presentation.restore();
            if (wasDark) document.documentElement.classList.add('dark');
            if (typeof Chart !== 'undefined') Chart.defaults.animation = previousAnimation;
            renderOverview();
        }
    }

    function downloadProjectJSON() {
        const project = currentProject();
        saveDOMToFY();
        downloadBlob(JSON.stringify({ schemaVersion: 2, project }, null, 2), `${project.name.replace(/[^a-z0-9]+/gi,'_')}_ESG_Project.json`, 'application/json;charset=utf-8');
        if (typeof trackEvent === 'function') trackEvent('download_project_json', { framework: project.framework });
    }

    function validateImportedProject(payload) {
        const metricFields = GRIMetrics.categories.flatMap(category => category.groups.flatMap(group => group.fields));
        const project = ProjectData.validatePayload(payload, {
            ghgFactors,
            ambitionMetrics: Object.keys(targetDefinitions),
            griStandardIds: GRIData.standards.map(standard => standard.id),
            griDisclosureKeys: GRIData.disclosures.map(disclosure => disclosure.key),
            griNumericFields: metricFields.filter(field => field[3] !== 'text' && field[3] !== 'select').map(field => field[0]),
            griTextFields: metricFields.filter(field => field[3] === 'text').map(field => field[0])
        });
        Object.entries(project.years).forEach(([year, data]) => {
            if (data.gri !== undefined) normalizeGRIState(project, data);
        });
        return project;
    }

    function importProjectJSON(file) {
        if (!file) return;
        if (file.size > ProjectData.MAX_IMPORT_BYTES) {
            alert('Import stopped. Choose a project JSON file smaller than 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const previousHash = appData.activeHash;
            let importedHash = null;
            try {
                const payload = JSON.parse(reader.result);
                const project = validateImportedProject(payload);
                const hash = generateHash();
                importedHash = hash;
                appData.projects[hash] = project;
                appData.activeHash = hash;
                renderProjectTabs();
                updateFYSelector();
                loadFYToDOM();
                saveAll();
                if (typeof trackEvent === 'function') trackEvent('import_project_json', { framework: project.framework });
            } catch (error) {
                if (importedHash) delete appData.projects[importedHash];
                appData.activeHash = previousHash;
                renderProjectTabs();
                if (previousHash && appData.projects[previousHash]) {
                    updateFYSelector();
                    loadFYToDOM();
                }
                saveAll();
                if (typeof trackEvent === 'function') trackEvent('import_project_json_failed');
                alert(`Import stopped. ${error.message}`);
            }
        };
        reader.onerror = () => alert('Import stopped. The selected file could not be read.');
        reader.readAsText(file);
    }

    function renderCalculationAlerts(errors) {
        const element = document.getElementById('calculation-alerts');
        if (!element) return;
        const unique = [...new Set(errors.filter(Boolean))];
        element.classList.toggle('hidden', unique.length === 0);
        element.innerHTML = unique.length ? `<strong>Fix these inputs</strong><ul class="list-disc pl-5 mt-2">${unique.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul>` : '';
    }

    function clearValidationSummary() {
        const element = document.getElementById('validation-summary');
        if (!element) return;
        element.className = 'hidden mb-6 rounded-lg border p-4 text-sm';
        element.textContent = '';
    }

    function runWorkspaceValidation() {
        saveDOMToFY();
        const project = currentProject();
        const element = document.getElementById('validation-summary');
        if (!project || !element) return;
        let message;
        let complete;
        if (project.framework === 'gri') {
            const metricErrors = GRIMetrics.calculate(ensureGRIState().metrics).errors.length;
            const failedGates = evaluateGates().filter(gate => !gate[2]).length;
            renderOverview();
            renderGRITab(currentTab);
            complete = metricErrors === 0 && failedGates === 0;
            if (complete) {
                message = 'Validation complete: no metric issues remain and all nine GRI readiness actions are complete.';
            } else {
                const actions = [];
                if (metricErrors) actions.push(`${metricErrors} metric action${metricErrors === 1 ? '' : 's'} in Metrics`);
                if (failedGates) actions.push(`${failedGates} readiness action${failedGates === 1 ? '' : 's'} on this dashboard`);
                message = `Resolve ${actions.join(' and ')} before export.`;
            }
        } else {
            const calculated = calculateAll();
            const issues = document.querySelectorAll('#calculation-alerts li').length;
            complete = calculated === true && issues === 0;
            message = complete
                ? 'Validation complete: no BRSR calculation issues were found.'
                : `Resolve the ${issues} highlighted input action${issues === 1 ? '' : 's'} above before export.`;
        }
        element.className = `mb-6 rounded-lg border p-4 text-sm ${complete ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200'}`;
        element.textContent = message;
        if (typeof trackEvent === 'function') trackEvent('workspace_validation', { framework: project.framework, type: complete ? 'passed' : 'actions' });
    }

    function openAnalyticsInfo() {
        document.getElementById('analytics-info-modal').classList.remove('hidden');
        if (typeof trackEvent === 'function') trackEvent('analytics_disclosure_opened');
    }

    function closeAnalyticsInfo() {
        document.getElementById('analytics-info-modal').classList.add('hidden');
    }

    function initGRI() {
        const project = currentProject();
        initializeGRIState(project, currentYearData(), project?.currentFY);
        applyFrameworkUI();
    }

    Object.assign(root, { initGRI, renderGRI, renderGRITab, refreshGRISharedViews, switchFramework, updateGRIProfile, toggleEvidenceRelevance, updateGRIMetricCategory, updateGRIMetricOpenGroup, updateGRIMetric, updateGRIWeight, toggleGRIStandard, updateGRITopic, addGRICustomTopic, removeGRICustomTopic, updateGRIRecommendation, updateGRIDisclosure, updateGRIFilter, downloadGRIMarkdown, downloadGRIDashboardPDF, downloadProjectJSON, importProjectJSON, validateImportedProject, renderCalculationAlerts, clearValidationSummary, runWorkspaceValidation, openAnalyticsInfo, closeAnalyticsInfo });
}(typeof globalThis !== 'undefined' ? globalThis : this));
