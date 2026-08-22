(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.ProjectData = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
    const MAX_YEARS = 50;
    const MAX_ROWS = 500;
    const MAX_AMBITIONS = 200;
    const MAX_TEXT = 20000;

    function record(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function fail(message) {
        throw new Error(message);
    }

    function text(value, label, maximum = MAX_TEXT, allowBlank = true) {
        if (typeof value !== 'string') fail(`${label} must be text.`);
        if (!allowBlank && !value.trim()) fail(`${label} cannot be blank.`);
        if (value.length > maximum) fail(`${label} is too long.`);
        return value;
    }

    function numeric(value, label, allowBlank = true) {
        if (allowBlank && (value === '' || value === null || value === undefined)) return '';
        if (!['string', 'number'].includes(typeof value) || !Number.isFinite(Number(value)) || Number(value) < 0) fail(`${label} must be zero or a positive number.`);
        return String(value);
    }

    function limitedArray(value, label, maximum = MAX_ROWS) {
        if (!Array.isArray(value)) fail(`${label} must be a list.`);
        if (value.length > maximum) fail(`${label} contains too many records.`);
        return value;
    }

    function sanitizeInputs(inputs, year) {
        if (!record(inputs)) fail(`Reporting year ${year} has unreadable inputs.`);
        const entries = Object.entries(inputs);
        if (entries.length > 1000) fail(`Reporting year ${year} contains too many inputs.`);
        return Object.fromEntries(entries.map(([key, value]) => {
            if (!/^[A-Za-z0-9_-]{1,100}$/.test(key)) fail(`Reporting year ${year} contains an invalid input name.`);
            if (!['string', 'number', 'boolean'].includes(typeof value) && value !== null) fail(`Input ${key} in ${year} has an unsupported value.`);
            if (typeof value === 'number' && !Number.isFinite(value)) fail(`Input ${key} in ${year} must be finite.`);
            if (typeof value === 'string' && value.length > MAX_TEXT) fail(`Input ${key} in ${year} is too long.`);
            return [key, value];
        }));
    }

    function sanitizeGHGRows(rows, year, factors) {
        return limitedArray(rows, `GHG sources in ${year}`).map((row, index) => {
            if (!record(row)) fail(`GHG source ${index + 1} in ${year} is unreadable.`);
            const source = text(row.source, `GHG source ${index + 1} type`, 50, false);
            const definition = factors[source];
            if (!definition) fail(`GHG source ${index + 1} in ${year} uses an unsupported factor type.`);
            return {
                desc: text(row.desc ?? '', `GHG source ${index + 1} description`, 500),
                source,
                factor: numeric(row.factor ?? row.customFactor ?? definition.value, `GHG source ${index + 1} factor`, false),
                factorSource: text(row.factorSource ?? definition.citation ?? '', `GHG source ${index + 1} factor reference`, 2000),
                activity: numeric(row.activity ?? '', `GHG source ${index + 1} activity`),
                scale: numeric(row.scale ?? definition.scale, `GHG source ${index + 1} scale`, false),
                unit: text(row.unit ?? definition.unit, `GHG source ${index + 1} unit`, 100, false)
            };
        });
    }

    function sanitizeWaterRows(rows, label, year) {
        return limitedArray(rows, `${label} rows in ${year}`).map((row, index) => {
            if (!record(row)) fail(`${label} row ${index + 1} in ${year} is unreadable.`);
            return {
                source: text(row.source ?? '', `${label} row ${index + 1} source`, 200, false),
                amount: numeric(row.amount ?? '', `${label} row ${index + 1} amount`)
            };
        });
    }

    function sanitizeMetrics(metrics) {
        if (!record(metrics)) return { ghg: null, water: null, energy: null, safety: null };
        return Object.fromEntries(['ghg', 'water', 'energy', 'safety'].map(key => {
            const value = metrics[key];
            return [key, value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value)];
        }));
    }

    function validateTree(value, label, depth = 0) {
        if (depth > 10) fail(`${label} is nested too deeply.`);
        if (typeof value === 'string' && value.length > MAX_TEXT) fail(`${label} contains text that is too long.`);
        if (typeof value === 'number' && !Number.isFinite(value)) fail(`${label} contains a non-finite number.`);
        if (Array.isArray(value)) {
            if (value.length > 5000) fail(`${label} contains too many records.`);
            value.forEach((item, index) => validateTree(item, `${label}[${index}]`, depth + 1));
        } else if (record(value)) {
            const entries = Object.entries(value);
            if (entries.length > 5000) fail(`${label} contains too many fields.`);
            entries.forEach(([key, item]) => {
                if (key.length > 500) fail(`${label} contains an invalid field name.`);
                validateTree(item, `${label}.${key}`, depth + 1);
            });
        } else if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) {
            fail(`${label} contains an unsupported value.`);
        }
    }

    function optionalText(value, label, maximum = MAX_TEXT) {
        if (value !== undefined) text(value, label, maximum);
    }

    function optionalBoolean(value, label) {
        if (value !== undefined && typeof value !== 'boolean') fail(`${label} must be true or false.`);
    }

    function optionalEnum(value, allowed, label) {
        if (value !== undefined && !allowed.includes(value)) fail(`${label} has an unsupported value.`);
    }

    function optionalBounded(value, label, minimum, maximum) {
        if (value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < minimum || Number(value) > maximum)) fail(`${label} must be between ${minimum} and ${maximum}.`);
    }

    function validDate(value) {
        if (value === '') return true;
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function validateTopic(topic, label) {
        if (!record(topic)) fail(`${label} is unreadable.`);
        optionalText(topic.title, `${label} title`, 500);
        optionalEnum(topic.decision, ['review', 'material', 'not_material'], `${label} decision`);
        optionalEnum(topic.priority, ['crucial', 'significant', 'low'], `${label} priority`);
        optionalEnum(topic.status, ['not_assessed', 'complete', 'partial', 'missing', 'omitted'], `${label} status`);
        optionalEnum(topic.omissionReason, ['', 'not_applicable', 'legal_prohibition', 'confidentiality', 'unavailable'], `${label} omission reason`);
        ['completeness', 'quality', 'evidenceRelevance'].forEach(field => optionalBounded(topic[field], `${label} ${field}`, 0, 1));
        ['explanation', 'management', 'managementLocation', 'alternativeDisclosures', 'omissionExplanation', 'omissionSteps', 'omissionTimeframe'].forEach(field => optionalText(topic[field], `${label} ${field}`));
    }

    function validateGRI(gri, year, options) {
        const profile = gri.profile;
        if (profile !== undefined) {
            if (!record(profile)) fail(`GRI profile in ${year} is unreadable.`);
            ['reportingStart', 'reportingEnd', 'publicationDate'].forEach(field => {
                if (profile[field] !== undefined && !validDate(profile[field])) fail(`GRI ${field} in ${year} must be a valid date.`);
            });
            optionalEnum(profile.sector, ['none', 'undetermined', 'not_applicable', 'gri14'], `GRI sector in ${year}`);
            optionalEnum(profile.notificationStatus, ['not_verified', 'planned', 'verified'], `GRI notification status in ${year}`);
            ['earlyAdoption', 'materialityProcessConfirmed', 'reportingPrinciplesConfirmed', 'statementConfirmed'].forEach(field => optionalBoolean(profile[field], `GRI ${field} in ${year}`));
            optionalText(profile.sectorRationale, `GRI sector rationale in ${year}`);
        }
        optionalBoolean(gri.useEvidenceRelevance, `GRI evidence relevance setting in ${year}`);
        if (gri.selectedStandards !== undefined) {
            if (!record(gri.selectedStandards)) fail(`GRI selected standards in ${year} are unreadable.`);
            const allowed = new Set(options.griStandardIds || []);
            Object.entries(gri.selectedStandards).forEach(([id, selected]) => {
                if (allowed.size && !allowed.has(id)) fail(`GRI standard ${id} in ${year} is not supported.`);
                if (typeof selected !== 'boolean') fail(`GRI standard ${id} selection in ${year} must be true or false.`);
            });
        }
        if (gri.weights !== undefined) {
            if (!record(gri.weights)) fail(`GRI weights in ${year} are unreadable.`);
            Object.entries(gri.weights).forEach(([field, value]) => optionalBounded(value, `GRI weight ${field} in ${year}`, 0, ['legalProhibition', 'confidentiality', 'unavailable'].includes(field) ? 1 : Number.MAX_SAFE_INTEGER));
        }
        if (gri.metrics !== undefined) {
            if (!record(gri.metrics)) fail(`GRI metrics in ${year} are unreadable.`);
            const numericFields = new Set(options.griNumericFields || []);
            const textFields = new Set(options.griTextFields || []);
            Object.entries(gri.metrics).forEach(([field, value]) => {
                if (field === 'injuryRateBase') optionalEnum(String(value), ['200000', '1000000'], `GRI injury rate base in ${year}`);
                else if (numericFields.has(field)) numeric(value, `GRI metric ${field} in ${year}`);
                else if (textFields.has(field)) text(value, `GRI metric ${field} in ${year}`);
                else fail(`GRI metric ${field} in ${year} is not supported.`);
            });
        }
        if (gri.topics !== undefined) {
            if (!record(gri.topics)) fail(`GRI sector topics in ${year} are unreadable.`);
            Object.entries(gri.topics).forEach(([id, topic]) => validateTopic(topic, `GRI topic ${id} in ${year}`));
        }
        if (gri.disclosures !== undefined) {
            if (!record(gri.disclosures)) fail(`GRI disclosures in ${year} are unreadable.`);
            const allowed = new Set(options.griDisclosureKeys || []);
            Object.entries(gri.disclosures).forEach(([key, disclosure]) => {
                if (allowed.size && !allowed.has(key)) fail(`GRI disclosure ${key} in ${year} is not supported.`);
                if (!record(disclosure)) fail(`GRI disclosure ${key} in ${year} is unreadable.`);
                optionalEnum(disclosure.applicability, ['not_selected', 'applicable'], `GRI disclosure ${key} applicability`);
                optionalEnum(disclosure.status, ['not_assessed', 'complete', 'partial', 'missing', 'omitted'], `GRI disclosure ${key} status`);
                optionalEnum(disclosure.materiality, ['universal', 'crucial', 'significant', 'low'], `GRI disclosure ${key} materiality`);
                optionalEnum(disclosure.omissionReason, ['', 'not_applicable', 'legal_prohibition', 'confidentiality', 'unavailable'], `GRI disclosure ${key} omission reason`);
                ['completeness', 'quality', 'evidenceRelevance'].forEach(field => optionalBounded(disclosure[field], `GRI disclosure ${key} ${field}`, 0, 1));
            });
        }
    }

    function validatePayload(payload, options = {}) {
        if (!record(payload) || payload.schemaVersion !== 2 || !record(payload.project)) fail('Choose a schema version 2 JSON file exported by this application.');
        const source = payload.project;
        if (!record(source.years) || Object.keys(source.years).length === 0) fail('Export the workspace again with at least one reporting year, then load that file.');
        if (Object.keys(source.years).length > MAX_YEARS) fail('The project contains too many reporting years.');
        const project = {
            name: text(source.name || 'Imported Project', 'Workspace name', 200).trim() || 'Imported Project',
            meta: {
                name: text(record(source.meta) ? source.meta.name ?? '' : '', 'Company name', 500),
                cin: text(record(source.meta) ? source.meta.cin ?? '' : '', 'Registration number', 500),
                author: text(record(source.meta) ? source.meta.author ?? '' : '', 'Reporting officer', 500)
            },
            framework: source.framework === 'gri' ? 'gri' : 'brsr',
            currentFY: text(source.currentFY, 'Current reporting year', 20, false),
            demo: source.demo === true,
            ambitions: [],
            years: {}
        };
        const allowedMetrics = new Set(options.ambitionMetrics || []);
        project.ambitions = limitedArray(source.ambitions ?? [], 'Ambitions', MAX_AMBITIONS).map((ambition, index) => {
            if (!record(ambition)) fail(`Ambition ${index + 1} is unreadable.`);
            if (!allowedMetrics.has(ambition.metric)) fail(`Ambition ${index + 1} uses an unsupported metric.`);
            const id = Number(ambition.id);
            const target = Number(ambition.target);
            if (!Number.isSafeInteger(id) || id < 0) fail(`Ambition ${index + 1} has an invalid identifier.`);
            if (!Number.isFinite(target) || target < 0) fail(`Ambition ${index + 1} must have a zero or positive target.`);
            return { id, metric: ambition.metric, year: text(ambition.year, `Ambition ${index + 1} target year`, 20, false), target };
        });
        const factors = options.ghgFactors || {};
        Object.entries(source.years).forEach(([year, data]) => {
            if (!/^\d{4}$/.test(year) || !record(data)) fail(`Reporting year ${year} is invalid.`);
            if (data.gri !== undefined) {
                if (!record(data.gri)) fail(`Export the workspace again; reporting year ${year} has unreadable GRI data.`);
                validateTree(data.gri, `GRI data for ${year}`);
                if (data.gri.customTopics !== undefined) {
                    const topics = limitedArray(data.gri.customTopics, `Custom GRI topics in ${year}`, MAX_ROWS);
                    const identifiers = new Set();
                    topics.forEach((topic, index) => {
                        if (!record(topic) || typeof topic.id !== 'string' || !/^[A-Za-z0-9._:-]{1,80}$/.test(topic.id)) fail(`Custom GRI topic ${index + 1} in ${year} has an invalid identifier.`);
                        if (identifiers.has(topic.id)) fail(`Custom GRI topic identifier ${topic.id} is duplicated in ${year}.`);
                        identifiers.add(topic.id);
                        text(topic.title ?? '', `Custom GRI topic ${index + 1} title`, 500);
                    });
                }
                validateGRI(data.gri, year, options);
            }
            project.years[year] = {
                ...data,
                inputs: sanitizeInputs(data.inputs, year),
                ghgRows: sanitizeGHGRows(data.ghgRows, year, factors),
                waterIn: sanitizeWaterRows(data.waterIn, 'Water withdrawal', year),
                waterOut: sanitizeWaterRows(data.waterOut, 'Water discharge', year),
                metrics: sanitizeMetrics(data.metrics)
            };
        });
        if (!Object.prototype.hasOwnProperty.call(project.years, project.currentFY)) fail('Export the workspace again after selecting a valid reporting year.');
        return project;
    }

    return { MAX_IMPORT_BYTES, record, validatePayload };
}));
