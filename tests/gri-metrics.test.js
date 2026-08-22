const test = require('node:test');
const assert = require('node:assert/strict');
const metrics = require('../js/gri-metrics.js');

test('metric registry has unique fields across reporting categories', () => {
    const fields = metrics.categories.flatMap(category => category.groups.flatMap(group => group.fields.map(field => field[0])));
    assert.equal(new Set(fields).size, fields.length);
    assert.deepEqual(metrics.categories.map(category => category.id), ['environmental', 'people', 'economic']);
});

test('demo values produce reconciled GRI indicators', () => {
    const calculated = metrics.calculate(metrics.demoValues());
    assert.deepEqual(calculated.errors, []);
    assert.equal(calculated.results.grossEmissions.value, 58700);
    assert.equal(calculated.results.operationalEmissions.value, 27700);
    assert.equal(calculated.results.ghgIntensity.value, 0.1108);
    assert.equal(calculated.results.netEnergy.value, 103000);
    assert.equal(calculated.results.energyIntensity.value, 0.412);
    assert.equal(calculated.results.waterConsumption.value, 170);
    assert.equal(calculated.results.waterStorageChange.value, 3);
    assert.equal(calculated.results.waterStressShare.value, 25);
    assert.equal(calculated.results.wasteDiverted.value, 900);
    assert.equal(calculated.results.wasteDisposed.value, 300);
    assert.equal(calculated.results.wasteVariance.value, 0);
    assert.equal(calculated.results.wasteDiversionRate.value, 75);
    assert.equal(calculated.results.collectiveCoverage.value, 70);
    assert.equal(calculated.results.trainingAverage.value, 24);
    assert.equal(calculated.results.payRatio.value, 0.96);
    assert.equal(calculated.results.employeeInjuryRate.value, 0.25);
    assert.equal(calculated.results.economicRetained.value, 158000000);
    assert.equal(calculated.results.localProcurement.value, 64);
});

test('blank metric state produces no results or false errors', () => {
    const calculated = metrics.calculate(metrics.defaultValues());
    assert.deepEqual(calculated.results, {});
    assert.deepEqual(calculated.errors, []);
});

test('absolute emissions and energy do not require intensity denominators', () => {
    const values = metrics.defaultValues();
    Object.assign(values, {
        scope1: '10', scope2Location: '20', scope3: '30',
        nonRenewableFuel: '100', renewableFuel: '20', purchasedElectricity: '30', purchasedThermal: '0', selfGeneratedRenewable: '5', energySold: '10'
    });
    const calculated = metrics.calculate(values);
    assert.equal(calculated.results.grossEmissions.value, 60);
    assert.equal(calculated.results.netEnergy.value, 145);
    assert.equal(calculated.results.ghgIntensity, undefined);
    assert.equal(calculated.results.energyIntensity, undefined);
    assert.deepEqual(calculated.errors, ['Energy balance: document the applicable GRI edition and confirm self-generated energy is not already included in fuel inputs.']);
});

test('independent workforce and supply-chain outputs do not require unrelated fields', () => {
    const values = metrics.defaultValues();
    Object.assign(values, { employees: '100', collectiveCovered: '75', localSpend: '40', procurementBudget: '100' });
    const calculated = metrics.calculate(values);
    assert.equal(calculated.results.collectiveCoverage.value, 75);
    assert.equal(calculated.results.localProcurement.value, 40);
    assert.equal(calculated.results.trainingAverage, undefined);
    assert.equal(calculated.results.environmentalScreening, undefined);
});

test('waste reconciliation does not require the hazardous subset', () => {
    const values = metrics.defaultValues();
    Object.assign(values, { wasteGenerated: '10', wasteReuse: '2', wasteRecycle: '3', wasteOtherRecovery: '0', wasteIncinerationRecovery: '0', wasteIncineration: '1', wasteLandfill: '4', wasteOtherDisposal: '0' });
    const calculated = metrics.calculate(values);
    assert.equal(calculated.results.wasteVariance.value, 0);
    assert.equal(calculated.results.hazardousWasteShare, undefined);
});

test('invalid injury-rate bases fail explicitly', () => {
    const values = metrics.defaultValues();
    Object.assign(values, { employeeInjuries: '1', employeeHours: '1000', injuryRateBase: 'invalid' });
    const calculated = metrics.calculate(values);
    assert.equal(calculated.results.employeeInjuryRate, undefined);
    assert.deepEqual(calculated.errors, ['Employee injury rate: select a supported rate base.']);
});

test('normalization bounds imported metric values and rate bases', () => {
    const normalized = metrics.normalizeValues({ employees: '-2', scope1: '10', workforceMethod: 42, injuryRateBase: '7' });
    assert.equal(normalized.employees, '');
    assert.equal(normalized.scope1, '10');
    assert.equal(normalized.workforceMethod, '');
    assert.equal(normalized.injuryRateBase, '200000');
});

test('zero intensity denominators preserve absolute totals and fail intensity', () => {
    const values = metrics.defaultValues();
    Object.assign(values, {
        nonRenewableFuel: '100', renewableFuel: '20', purchasedElectricity: '30', purchasedThermal: '0', selfGeneratedRenewable: '5', energySold: '10', energyDenominator: '0'
    });
    const calculated = metrics.calculate(values);
    assert.equal(calculated.results.netEnergy.value, 145);
    assert.equal(calculated.results.energyIntensity.value, null);
    assert.equal(calculated.results.energyIntensity.error, 'Energy intensity: enter the Energy intensity denominator greater than 0.');
});

test('invalid reconciliations fail visibly', () => {
    const values = metrics.defaultValues();
    Object.assign(values, { waterWithdrawal: '10', waterDischarge: '12' });
    const water = metrics.calculate(values);
    assert.equal(water.results.waterConsumption.value, null);
    assert.equal(water.results.waterConsumption.error, 'Water consumption: reduce discharge to withdrawal or below, or align their boundary and units.');
    Object.assign(values, { wasteGenerated: '10', wasteReuse: '5', wasteRecycle: '5', wasteOtherRecovery: '1', wasteIncinerationRecovery: '0', wasteIncineration: '0', wasteLandfill: '0', wasteOtherDisposal: '0', wasteHazardous: '1' });
    const waste = metrics.calculate(values);
    assert.equal(waste.results.wasteVariance.value, null);
    assert.equal(waste.results.wasteVariance.error, 'Waste reconciliation: reduce diverted or disposed waste, or correct generated waste, until the totals balance.');
});

test('partial groups remain unavailable and identify missing inputs', () => {
    const values = metrics.defaultValues();
    values.scope1 = '100';
    const calculated = metrics.calculate(values);
    assert.equal(calculated.results.grossEmissions, undefined);
    assert.ok(calculated.errors.some(error => error === 'Gross Scope 2, location-based: enter zero or a positive number.'));
});
