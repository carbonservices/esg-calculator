(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.ESGCalculations = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function number(value) {
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function nonNegative(value, label) {
        const parsed = number(value);
        if (parsed === null) return { value: null, error: `${label}: enter zero or a positive number.` };
        if (parsed < 0) return { value: null, error: `${label}: replace the negative value with zero or a positive number.` };
        return { value: parsed, error: null };
    }

    function sum(values, label) {
        if (values.every(value => number(value) === null && (value === null || value === undefined || String(value).trim() === ''))) return { value: null, errors: [] };
        const parsed = values.map((value, index) => nonNegative(value, `${label} item ${index + 1}`));
        const errors = parsed.filter(result => result.error).map(result => result.error);
        return { value: errors.length ? null : parsed.reduce((total, result) => total + result.value, 0), errors };
    }

    function divide(numerator, denominator, multiplier, label, numeratorLabel = 'numerator', denominatorLabel = 'denominator') {
        const n = number(numerator);
        const d = number(denominator);
        if (n === null && d === null) return { value: null, error: null };
        if (n === null) return { value: null, error: `${label}: enter ${numeratorLabel}.` };
        if (n < 0) return { value: null, error: `${label}: enter zero or a positive value for ${numeratorLabel}.` };
        if (d === null || d <= 0) return { value: null, error: `${label}: enter ${denominatorLabel} greater than 0.` };
        return { value: (n / d) * multiplier, error: null };
    }

    function percentage(numerator, denominator, label, numeratorLabel = 'numerator', denominatorLabel = 'denominator') {
        const result = divide(numerator, denominator, 100, label, numeratorLabel, denominatorLabel);
        if (!result.error && number(numerator) > number(denominator)) {
            return { value: null, error: `${label}: reduce ${numeratorLabel} to no more than ${denominatorLabel}, or correct ${denominatorLabel}.` };
        }
        return result;
    }

    function intensity(numerator, denominator, label, numeratorLabel = 'numerator', denominatorLabel = 'denominator') {
        return divide(numerator, denominator, 1, label, numeratorLabel, denominatorLabel);
    }

    function waterBalance(withdrawal, discharge) {
        const w = number(withdrawal);
        const d = number(discharge);
        if (w === null && d === null) return { value: null, error: null };
        if (w === null || d === null) return { value: null, error: 'Water consumption: enter both withdrawal and discharge.' };
        if (w < 0 || d < 0) return { value: null, error: 'Water consumption: replace negative withdrawal or discharge with zero or a positive value.' };
        if (d > w) return { value: null, error: 'Water consumption: reduce discharge to withdrawal or below, or align their boundary and units.' };
        return { value: w - d, error: null };
    }

    function wasteBalance(generated, recovered, disposed) {
        const g = number(generated);
        const r = number(recovered);
        const d = number(disposed);
        if ([g, r, d].every(v => v === null)) return { value: null, error: null };
        if ([g, r, d].some(v => v === null)) return { value: null, error: 'Waste reconciliation: enter generated, diverted, and disposed waste.' };
        if ([g, r, d].some(v => v < 0)) return { value: null, error: 'Waste reconciliation: replace negative values with zero or positive values.' };
        const other = g - r - d;
        if (other < 0) return { value: null, error: 'Waste reconciliation: reduce diverted or disposed waste, or correct generated waste, until the totals balance.' };
        return { value: other, error: null };
    }

    function ghgTotal(rows) {
        const errors = [];
        let total = 0;
        let populatedRows = 0;
        const values = rows.map((row, index) => {
            const factor = number(row.factor);
            const activity = number(row.activity);
            const scale = number(row.scale);
            if (activity === null && (row.activity === null || row.activity === undefined || String(row.activity).trim() === '')) return null;
            if (factor === null || activity === null || scale === null || factor < 0 || activity < 0 || scale < 0) {
                errors.push(`GHG source ${index + 1}: enter zero or positive numbers for factor, activity, and scale.`);
                return null;
            }
            const value = factor * activity * scale;
            populatedRows += 1;
            total += value;
            return value;
        });
        return { total: errors.length || populatedRows === 0 ? null : total, values, errors };
    }

    function clamp01(value) {
        const parsed = number(value);
        if (parsed === null) return 0;
        return Math.min(1, Math.max(0, parsed));
    }

    function disclosureReadiness(completeness, quality, evidenceRelevance, useEvidenceRelevance) {
        const c = clamp01(completeness);
        const q = clamp01(quality);
        const e = useEvidenceRelevance ? clamp01(evidenceRelevance) : 1;
        return 100 * c * q * e;
    }

    function weightedReadiness(rows, useEvidenceRelevance) {
        let numerator = 0;
        let denominator = 0;
        rows.forEach(row => {
            if (row.excludeFromScore) return;
            const weight = number(row.weight);
            if (weight === null || weight <= 0) return;
            numerator += weight * disclosureReadiness(row.completeness, row.quality, row.evidenceRelevance, useEvidenceRelevance);
            denominator += weight;
        });
        return denominator > 0 ? numerator / denominator : 0;
    }

    return { number, nonNegative, sum, divide, percentage, intensity, waterBalance, wasteBalance, ghgTotal, clamp01, disclosureReadiness, weightedReadiness };
}));
