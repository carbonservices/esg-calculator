(function (root, factory) {
    const calculations = typeof module === 'object' && module.exports ? require('./calculations.js') : root.ESGCalculations;
    const api = factory(calculations);
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.GRIMetrics = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (calc) {
    const categories = [
        {
            id: 'environmental', label: 'Environmental', icon: 'fa-leaf', groups: [
                {
                    id: 'emissions', title: 'Gross GHG emissions', standards: 'GRI 305-1 to 305-4; GRI 102-5 to 102-8 from 2027', formula: 'Gross inventory = Scope 1 + location-based Scope 2 + Scope 3. Market-based Scope 2 remains a separate disclosure and is not added again.', fields: [
                        ['scope1','Gross Scope 1','tCO₂e'],['scope2Location','Gross Scope 2, location-based','tCO₂e'],['scope2Market','Gross Scope 2, market-based','tCO₂e'],['scope3','Gross Scope 3','tCO₂e'],['ghgDenominator','Intensity denominator (> 0)','units'],['ghgDenominatorUnit','Denominator description','e.g. tonne of product','text'],['emissionsBoundary','Boundary and scopes included','Entities, sites and value-chain scope','text'],['emissionsMethod','Factors, GWP source and method version','Method and source','text']
                    ]
                },
                {
                    id: 'energy', title: 'Energy balance', standards: 'GRI 302-1 and 302-3; GRI 103-2 and 103-4 from 2027', formula: 'Net energy = non-renewable fuel + renewable fuel + purchased electricity + purchased thermal energy + self-generated renewable energy not already counted in fuel − energy sold.', fields: [
                        ['nonRenewableFuel','Non-renewable fuel','GJ'],['renewableFuel','Renewable fuel','GJ'],['purchasedElectricity','Purchased electricity','GJ'],['purchasedThermal','Purchased heating, cooling and steam','GJ'],['selfGeneratedRenewable','Self-generated renewable energy not already counted','GJ'],['energySold','Electricity, heating, cooling and steam sold','GJ'],['energyDenominator','Intensity denominator (> 0)','units'],['energyDenominatorUnit','Denominator description','e.g. tonne of product','text'],['energyBoundary','Energy boundary','Entities and sites','text'],['energyMethod','Edition, conversion factors and double-counting control','Method and source','text']
                    ]
                },
                {
                    id: 'water', title: 'Water balance', standards: 'GRI 303-3 to 303-5', formula: 'Water consumption = total withdrawal − total discharge when consumption is not directly measured. Storage change is disclosed separately.', fields: [
                        ['waterWithdrawal','Total water withdrawal','ML'],['waterDischarge','Total water discharge','ML'],['waterStressWithdrawal','Withdrawal from water-stressed areas','ML'],['waterStorageStart','Water storage at period start','ML'],['waterStorageEnd','Water storage at period end','ML'],['waterBoundary','Water boundary and catchments','Sites, catchments and stress method','text'],['waterMethod','Measurement or estimation method','Method and source','text']
                    ]
                },
                {
                    id: 'waste', title: 'Waste reconciliation', standards: 'GRI 306-3 to 306-5 (2020)', formula: 'Waste generated = diverted from disposal + directed to disposal. Every treatment route requires an explicit value, including zero.', fields: [
                        ['wasteGenerated','Waste generated','t'],['wasteReuse','Preparation for reuse','t'],['wasteRecycle','Recycling','t'],['wasteOtherRecovery','Other recovery','t'],['wasteIncinerationRecovery','Incineration with energy recovery','t'],['wasteIncineration','Incineration without energy recovery','t'],['wasteLandfill','Landfill','t'],['wasteOtherDisposal','Other disposal','t'],['wasteHazardous','Hazardous waste within generated total','t'],['wasteBoundary','Waste boundary and contractors','Sites and value-chain scope','text'],['wasteMethod','Estimates and measurement method','Method and source','text']
                    ]
                }
            ]
        },
        {
            id: 'people', label: 'People', icon: 'fa-people-group', groups: [
                {
                    id: 'workforce', title: 'Workforce, bargaining and training', standards: 'GRI 2-7, 2-30 and GRI 404-1', formula: 'Collective bargaining coverage = covered employees ÷ employees × 100. Average training hours = training hours ÷ employees.', fields: [
                        ['employees','Employees','people'],['collectiveCovered','Employees covered by collective bargaining','people'],['trainingHours','Employee training hours','hours'],['femaleSalary','Women’s basic salary or remuneration','currency/unit'],['maleSalary','Men’s basic salary or remuneration','currency/unit'],['workforceMethod','Head count/FTE basis, category and location','Method and boundary','text']
                    ]
                },
                {
                    id: 'safety', title: 'Occupational injury rates', standards: 'GRI 403-9', formula: 'Rate = recordable work-related injuries ÷ hours worked × selected rate base. Employees and controlled non-employee workers are calculated separately.', fields: [
                        ['employeeInjuries','Employee recordable injuries','cases'],['employeeHours','Employee hours worked','hours'],['workerInjuries','Controlled non-employee recordable injuries','cases'],['workerHours','Controlled non-employee hours worked','hours'],['injuryRateBase','Rate base','hours','select',[['200000','200,000 hours'],['1000000','1,000,000 hours']]],['safetyBoundary','Worker boundary and exclusions','Method and boundary','text']
                    ]
                }
            ]
        },
        {
            id: 'economic', label: 'Economic & supply chain', icon: 'fa-chart-line', groups: [
                {
                    id: 'economicValue', title: 'Economic value generated and distributed', standards: 'GRI 201-1', formula: 'Economic value retained = direct economic value generated − operating costs − wages and benefits − capital-provider payments − government payments − community investment.', fields: [
                        ['economicGenerated','Direct economic value generated','currency'],['operatingCosts','Operating costs','currency'],['wagesBenefits','Employee wages and benefits','currency'],['capitalPayments','Payments to providers of capital','currency'],['governmentPayments','Payments to government','currency'],['communityInvestment','Community investment','currency'],['economicMethod','Currency, consolidation and reconciliation basis','Method and boundary','text']
                    ]
                },
                {
                    id: 'supplyChain', title: 'Local procurement and supplier screening', standards: 'GRI 204-1, 308-1 and 414-1', formula: 'Each percentage uses its disclosed population: local spend ÷ procurement budget; screened new suppliers ÷ all new suppliers.', fields: [
                        ['localSpend','Spend with local suppliers','currency'],['procurementBudget','Procurement budget at significant locations','currency'],['newSuppliers','New suppliers','suppliers'],['environmentalScreened','New suppliers environmentally screened','suppliers'],['socialScreened','New suppliers socially screened','suppliers'],['supplierBoundary','Definition of local, significant locations and screening scope','Method and boundary','text']
                    ]
                }
            ]
        }
    ];

    const numericFields = categories.flatMap(category => category.groups.flatMap(group => group.fields.filter(field => field[3] !== 'text' && field[3] !== 'select').map(field => field[0])));
    const textFields = categories.flatMap(category => category.groups.flatMap(group => group.fields.filter(field => field[3] === 'text').map(field => field[0])));
    const fieldMap = new Map(categories.flatMap(category => category.groups.flatMap(group => group.fields)).map(field => [field[0], field]));

    function defaultValues() {
        const values = Object.fromEntries([...numericFields, ...textFields].map(id => [id, '']));
        values.injuryRateBase = '200000';
        return values;
    }

    function demoValues() {
        return {
            ...defaultValues(),
            scope1: '18500', scope2Location: '9200', scope2Market: '7600', scope3: '31000', ghgDenominator: '250000', ghgDenominatorUnit: 'tonnes of product', emissionsBoundary: 'Illustrative consolidated operations', emissionsMethod: 'Illustrative GHG Protocol inventory; replace factors and GWP version',
            nonRenewableFuel: '62000', renewableFuel: '8500', purchasedElectricity: '24500', purchasedThermal: '3000', selfGeneratedRenewable: '6500', energySold: '1500', energyDenominator: '250000', energyDenominatorUnit: 'tonnes of product', energyBoundary: 'Illustrative operating sites', energyMethod: 'GJ conversions shown for demonstration only',
            waterWithdrawal: '480', waterDischarge: '310', waterStressWithdrawal: '120', waterStorageStart: '18', waterStorageEnd: '21', waterBoundary: 'Illustrative sites and catchments', waterMethod: 'Metered volumes; stress classification must be replaced',
            wasteGenerated: '1200', wasteReuse: '100', wasteRecycle: '760', wasteOtherRecovery: '40', wasteIncinerationRecovery: '25', wasteIncineration: '15', wasteLandfill: '210', wasteOtherDisposal: '50', wasteHazardous: '90', wasteBoundary: 'Illustrative operating sites and waste contractors', wasteMethod: 'Manifest weights; replace with approved source records',
            employees: '1200', collectiveCovered: '840', trainingHours: '28800', femaleSalary: '0.96', maleSalary: '1', workforceMethod: 'Illustrative period-end head count',
            employeeInjuries: '3', employeeHours: '2400000', workerInjuries: '2', workerHours: '900000', injuryRateBase: '200000', safetyBoundary: 'Illustrative employees and controlled workers reported separately',
            economicGenerated: '1250000000', operatingCosts: '720000000', wagesBenefits: '180000000', capitalPayments: '95000000', governmentPayments: '85000000', communityInvestment: '12000000', economicMethod: 'Illustrative INR values; reconcile to audited accounts',
            localSpend: '320000000', procurementBudget: '500000000', newSuppliers: '240', environmentalScreened: '220', socialScreened: '210', supplierBoundary: 'Illustrative significant locations and reporting-period vendor population'
        };
    }

    function normalizeValues(saved) {
        const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
        const values = defaultValues();
        numericFields.forEach(id => {
            const value = source[id];
            values[id] = value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < 0 ? '' : String(value);
        });
        textFields.forEach(id => { values[id] = typeof source[id] === 'string' ? source[id] : ''; });
        values.injuryRateBase = ['200000', '1000000'].includes(String(source.injuryRateBase)) ? String(source.injuryRateBase) : '200000';
        return values;
    }

    function calculate(values) {
        const errors = [];
        const results = {};
        const blank = value => value === null || value === undefined || String(value).trim() === '';
        const required = (ids, label) => {
            if (ids.every(id => blank(values[id]))) return null;
            const parsed = {};
            ids.forEach(id => {
                const field = fieldMap.get(id);
                const result = calc.nonNegative(values[id], field ? field[1] : label);
                if (result.error) errors.push(result.error);
                parsed[id] = result.value;
            });
            return Object.values(parsed).some(value => value === null) ? null : parsed;
        };
        const addResult = (id, label, value, unit, formula, category, group, error = null) => {
            if (error) errors.push(error);
            results[id] = { label, value: error ? null : value, unit, formula, category, group, error };
        };
        const emissions = required(['scope1','scope2Location'], 'Operational emissions');
        if (emissions) {
            const operational = emissions.scope1 + emissions.scope2Location;
            addResult('operationalEmissions', 'Gross Scope 1 and 2', operational, 'tCO₂e', 'S1 + location-based S2', 'environmental', 'emissions');
            if (!blank(values.ghgDenominator)) {
                const intensity = calc.intensity(operational, values.ghgDenominator, 'GHG intensity', 'Scope 1 and 2 emissions', 'the GHG intensity denominator');
                addResult('ghgIntensity', 'Scope 1 and 2 intensity', intensity.value, 'tCO₂e / denominator', 'Gross S1 and S2 ÷ activity denominator', 'environmental', 'emissions', intensity.error);
            }
        }
        if (emissions && !blank(values.scope3)) {
            const scope3 = calc.nonNegative(values.scope3, 'Gross Scope 3');
            if (scope3.error) errors.push(scope3.error);
            else addResult('grossEmissions', 'Gross Scope 1, 2 and 3', emissions.scope1 + emissions.scope2Location + scope3.value, 'tCO₂e', 'S1 + location-based S2 + S3', 'environmental', 'emissions');
        }
        if (!blank(values.scope2Market)) {
            const market = calc.nonNegative(values.scope2Market, 'Gross Scope 2, market-based');
            addResult('scope2Market', 'Market-based Scope 2', market.value, 'tCO₂e', 'Reported separately; not added to location-based Scope 2', 'environmental', 'emissions', market.error);
        }
        const energy = required(['nonRenewableFuel','renewableFuel','purchasedElectricity','purchasedThermal','selfGeneratedRenewable','energySold'], 'Energy balance');
        if (energy) {
            const gross = energy.nonRenewableFuel + energy.renewableFuel + energy.purchasedElectricity + energy.purchasedThermal + energy.selfGeneratedRenewable;
            const net = gross - energy.energySold;
            const error = net < 0 ? 'Energy balance: reduce Energy sold or correct the energy inputs so sold energy does not exceed total inputs.' : null;
            addResult('netEnergy', 'Net energy consumption', net, 'GJ', 'Fuel + purchased + non-duplicated self-generation − sold', 'environmental', 'energy', error);
            if (energy.selfGeneratedRenewable > 0 && blank(values.energyMethod)) errors.push('Energy balance: document the applicable GRI edition and confirm self-generated energy is not already included in fuel inputs.');
            if (!blank(values.energyDenominator)) {
                const intensity = error ? { value: null, error: null } : calc.intensity(net, values.energyDenominator, 'Energy intensity', 'net energy', 'the Energy intensity denominator');
                addResult('energyIntensity', 'Energy intensity', intensity.value, 'GJ / denominator', 'Net energy ÷ activity denominator', 'environmental', 'energy', intensity.error);
            }
        }
        const water = required(['waterWithdrawal','waterDischarge'], 'Water balance');
        if (water) {
            const consumption = calc.waterBalance(water.waterWithdrawal, water.waterDischarge);
            addResult('waterConsumption', 'Water consumption', consumption.value, 'ML', 'Withdrawal − discharge', 'environmental', 'water', consumption.error);
        }
        const storage = required(['waterStorageStart','waterStorageEnd'], 'Water storage');
        if (storage) addResult('waterStorageChange', 'Change in water storage', storage.waterStorageEnd - storage.waterStorageStart, 'ML', 'Ending storage − beginning storage', 'environmental', 'water');
        const stress = required(['waterStressWithdrawal','waterWithdrawal'], 'Water-stress withdrawal share');
        if (stress) {
            const ratio = calc.percentage(stress.waterStressWithdrawal, stress.waterWithdrawal, 'Water-stress withdrawal share', 'Withdrawal from water-stressed areas', 'Total water withdrawal');
            addResult('waterStressShare', 'Withdrawal from stressed areas', ratio.value, '%', 'Stress-area withdrawal ÷ total withdrawal × 100', 'environmental', 'water', ratio.error);
        }
        const waste = required(['wasteGenerated','wasteReuse','wasteRecycle','wasteOtherRecovery','wasteIncinerationRecovery','wasteIncineration','wasteLandfill','wasteOtherDisposal'], 'Waste reconciliation');
        if (waste) {
            const diverted = waste.wasteReuse + waste.wasteRecycle + waste.wasteOtherRecovery;
            const disposed = waste.wasteIncinerationRecovery + waste.wasteIncineration + waste.wasteLandfill + waste.wasteOtherDisposal;
            const balance = calc.wasteBalance(waste.wasteGenerated, diverted, disposed);
            addResult('wasteDiverted', 'Waste diverted', diverted, 't', 'Reuse + recycling + other recovery', 'environmental', 'waste');
            addResult('wasteDisposed', 'Waste directed to disposal', disposed, 't', 'All disposal routes', 'environmental', 'waste');
            addResult('wasteVariance', 'Waste reconciliation variance', balance.value, 't', 'Generated − diverted − disposed', 'environmental', 'waste', balance.error);
            const ratio = calc.percentage(diverted, waste.wasteGenerated, 'Waste diversion rate', 'diverted waste', 'Waste generated');
            addResult('wasteDiversionRate', 'Waste diversion rate', ratio.value, '%', 'Diverted ÷ generated × 100', 'environmental', 'waste', ratio.error);
        }
        const hazardousWaste = required(['wasteHazardous','wasteGenerated'], 'Hazardous waste share');
        if (hazardousWaste) {
            const hazardous = calc.percentage(hazardousWaste.wasteHazardous, hazardousWaste.wasteGenerated, 'Hazardous waste share', 'Hazardous waste', 'Waste generated');
            addResult('hazardousWasteShare', 'Hazardous waste share', hazardous.value, '%', 'Hazardous ÷ generated × 100', 'environmental', 'waste', hazardous.error);
        }
        const bargainingValues = required(['employees','collectiveCovered'], 'Collective bargaining coverage');
        if (bargainingValues) {
            const bargaining = calc.percentage(bargainingValues.collectiveCovered, bargainingValues.employees, 'Collective bargaining coverage', 'Employees covered by collective bargaining', 'Employees');
            addResult('collectiveCoverage', 'Collective bargaining coverage', bargaining.value, '%', 'Covered employees ÷ employees × 100', 'people', 'workforce', bargaining.error);
        }
        const trainingValues = required(['employees','trainingHours'], 'Average training hours');
        if (trainingValues) {
            const training = calc.divide(trainingValues.trainingHours, trainingValues.employees, 1, 'Average training hours', 'Employee training hours', 'Employees');
            addResult('trainingAverage', 'Average training hours', training.value, 'hours / employee', 'Training hours ÷ employees', 'people', 'workforce', training.error);
        }
        const payValues = required(['femaleSalary','maleSalary'], 'Women-to-men pay ratio');
        if (payValues) {
            const pay = calc.divide(payValues.femaleSalary, payValues.maleSalary, 1, 'Women-to-men pay ratio', 'Women’s salary or remuneration', 'Men’s salary or remuneration');
            addResult('payRatio', 'Women-to-men pay ratio', pay.value, 'ratio', 'Women’s value ÷ men’s value', 'people', 'workforce', pay.error);
        }
        const base = ['200000', '1000000'].includes(String(values.injuryRateBase)) ? Number(values.injuryRateBase) : null;
        [['employee','Employee'],['worker','Controlled worker']].forEach(([prefix, label]) => {
            const safety = required([`${prefix}Injuries`,`${prefix}Hours`], `${label} injury rate`);
            if (!safety) return;
            if (base === null) {
                errors.push(`${label} injury rate: select a supported rate base.`);
                return;
            }
            const rate = calc.divide(safety[`${prefix}Injuries`], safety[`${prefix}Hours`], base, `${label} injury rate`, `${label.toLowerCase()} recordable injuries`, `${label.toLowerCase()} hours worked`);
            addResult(`${prefix}InjuryRate`, `${label} recordable injury rate`, rate.value, `per ${base.toLocaleString()} hours`, 'Recordable injuries ÷ hours × rate base', 'people', 'safety', rate.error);
        });
        const economic = required(['economicGenerated','operatingCosts','wagesBenefits','capitalPayments','governmentPayments','communityInvestment'], 'Economic value');
        if (economic) {
            const distributed = economic.operatingCosts + economic.wagesBenefits + economic.capitalPayments + economic.governmentPayments + economic.communityInvestment;
            const retained = economic.economicGenerated - distributed;
            const error = retained < 0 ? 'Economic value: reduce distributed components or correct generated value, boundary, and units until retained value is not negative.' : null;
            addResult('economicDistributed', 'Economic value distributed', distributed, 'currency', 'Sum of distributed components', 'economic', 'economicValue');
            addResult('economicRetained', 'Economic value retained', retained, 'currency', 'Generated − distributed', 'economic', 'economicValue', error);
        }
        [['localProcurement','Local procurement','localSpend','procurementBudget'],['environmentalScreening','Environmental supplier screening','environmentalScreened','newSuppliers'],['socialScreening','Social supplier screening','socialScreened','newSuppliers']].forEach(([id,label,numeratorId,denominatorId]) => {
            const supply = required([numeratorId, denominatorId], label);
            if (supply) {
                const names = {
                    localProcurement: ['Spend with local suppliers', 'Procurement budget'],
                    environmentalScreening: ['Environmentally screened new suppliers', 'New suppliers'],
                    socialScreening: ['Socially screened new suppliers', 'New suppliers']
                }[id];
                const ratio = calc.percentage(supply[numeratorId], supply[denominatorId], label, names[0], names[1]);
                addResult(id, label, ratio.value, '%', 'Numerator ÷ relevant population × 100', 'economic', 'supplyChain', ratio.error);
            }
        });
        return { results, errors: [...new Set(errors)] };
    }

    return { categories, defaultValues, demoValues, normalizeValues, calculate };
}));
