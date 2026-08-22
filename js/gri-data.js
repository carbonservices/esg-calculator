(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.GRIData = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const disclosures = [];

    function add(standard, group, text) {
        text.trim().split('\n').forEach(line => {
            const [id, title, requirement, facts = ''] = line.split('|');
            disclosures.push({
                key: `${standard}:${id}`,
                id,
                title,
                requirement,
                standard,
                group,
                sharedFacts: facts ? facts.split(',') : []
            });
        });
    }

    add('GRI 2: General Disclosures 2021', 'Universal', `
2-1|Organizational details|Legal name, ownership and legal form, headquarters, and countries of operation.|organization.name
2-2|Entities included in sustainability reporting|Entities, differences from financial reporting, and consolidation approach.|organization.boundary
2-3|Reporting period, frequency and contact point|Reporting dates, frequency, publication date, and contact.|report.period
2-4|Restatements of information|Restated values, reasons, and effects.|report.restated
2-5|External assurance|Policy, scope, basis, provider relationship, and assurance statement.|assurance.scope
2-6|Activities, value chain and business relationships|Sectors, activities, products, markets, supply chain, relationships, and significant changes.|organization.activities
2-7|Employees|Employees by gender, region, contract and work type, with method and fluctuations.|workforce.employees
2-8|Workers who are not employees|Worker count, types, relationship, method, and fluctuations.|workforce.nonEmployees
2-9|Governance structure and composition|Governance bodies, committees, composition, independence, tenure, competencies, and diversity.|governance.structure
2-10|Nomination and selection of the highest governance body|Nomination process and stakeholder, diversity, independence, and competency criteria.|governance.nomination
2-11|Chair of the highest governance body|State whether the chair is also a senior executive and explain.|governance.chair
2-12|Role in overseeing management of impacts|Governance oversight of impacts, due diligence, and stakeholder engagement.|governance.impactOversight
2-13|Delegation of responsibility for managing impacts|Delegated roles and reporting frequency.|governance.delegation
2-14|Role in sustainability reporting|Review and approval of reported information and material topics.|governance.reportingApproval
2-15|Conflicts of interest|Prevention, mitigation, and disclosure processes.|governance.conflicts
2-16|Communication of critical concerns|Communication process and total critical concerns.|governance.criticalConcerns
2-17|Collective knowledge of the highest governance body|Measures to advance knowledge of sustainable development.|governance.knowledge
2-18|Evaluation of the highest governance body|Evaluation process, independence, frequency, and actions.|governance.evaluation
2-19|Remuneration policies|Fixed and variable pay, incentives, termination, clawbacks, retirement benefits, and impact links.|governance.remuneration
2-20|Process to determine remuneration|Process, independent oversight, stakeholder voting, and results.|governance.remunerationProcess
2-21|Annual total compensation ratio|Highest-paid and median compensation ratios, percentage-change ratios, and method.|workforce.compensation
2-22|Statement on sustainable development strategy|Statement from the most senior decision-maker.|report.strategyStatement
2-23|Policy commitments|Responsible-business and human-rights commitments, instruments, due diligence, approval, and communication.|policies.commitments
2-24|Embedding policy commitments|Implementation through strategy, procedures, responsibilities, training, and relationships.|policies.implementation
2-25|Processes to remediate negative impacts|Remediation commitments, mechanisms, and effectiveness tracking.|grievance.remediation
2-26|Mechanisms for seeking advice and raising concerns|Accessible advice and concern-raising channels.|grievance.channels
2-27|Compliance with laws and regulations|Significant non-compliance, sanctions, fines, and significance criteria.|compliance.incidents
2-28|Membership associations|Significant industry and other memberships.|organization.memberships
2-29|Approach to stakeholder engagement|Stakeholder categories, purpose, method, and meaningful-engagement safeguards.|stakeholders.engagement
2-30|Collective bargaining agreements|Employees covered and conditions for uncovered employees.|workforce.collectiveBargaining
`);

    add('GRI 3: Material Topics 2021', 'Universal', `
3-1|Process to determine material topics|Context, impact identification and assessment, stakeholder and expert input, and governance.|materiality.process
3-2|List of material topics|Material topics and changes from the previous reporting period.|materiality.topics
3-3|Management of material topics|Impacts, involvement, policies, actions, effectiveness, goals, indicators, and stakeholder learning for each topic.|materiality.management
`);

    add('GRI 101: Biodiversity 2024', 'Environmental', `
101-1|Policies to halt and reverse biodiversity loss|Policy commitments, scope, goals, targets, and alignment with biodiversity frameworks.|biodiversity.policies
101-2|Management of biodiversity impacts|Mitigation hierarchy, actions, monitoring, restoration, offsets, and value-chain engagement.|biodiversity.management
101-3|Access and benefit-sharing|Access to genetic resources and fair and equitable sharing of benefits.|biodiversity.benefitSharing
101-4|Identification of biodiversity impacts|Methods, scope, value-chain coverage, affected biodiversity, and significant impacts.|biodiversity.impacts
101-5|Locations with biodiversity impacts|Site location, size, ecosystem, protected status, and proximity information.|biodiversity.locations
101-6|Direct drivers of biodiversity loss|Land and sea-use change, exploitation, climate, pollution, and invasive-species drivers.|biodiversity.drivers
101-7|Changes to the state of biodiversity|Ecosystem extent and condition against a reference state and affected species.|biodiversity.state
101-8|Ecosystem services|Affected ecosystem services, beneficiaries, dependencies, and management.|biodiversity.services
`);

    add('GRI 102: Climate Change 2025', 'Environmental', `
102-1|Transition plan for climate change mitigation|Transition plan, targets, actions, governance, dependencies, finance, and progress.|climate.transition
102-2|Climate change adaptation plan|Physical risks, scenarios, adaptation actions, expenditure, and progress.|climate.adaptation
102-3|Just transition|Worker and community effects, engagement, reskilling, social protection, and outcomes.|climate.justTransition
102-4|GHG emissions reduction targets and progress|Targets, scopes, base year, coverage, pathways, actions, and progress.|ghg.targets
102-5|Scope 1 GHG emissions|Gross Scope 1 emissions, gases, biogenic CO2, base year, factors, and consolidation.|ghg.scope1
102-6|Scope 2 GHG emissions|Location- and market-based Scope 2 emissions, factors, base year, and methods.|ghg.scope2
102-7|Scope 3 GHG emissions|Gross Scope 3 by category, exclusions, primary data, base year, and method.|ghg.scope3
102-8|GHG emissions intensity|Intensity ratios, denominator, scopes, gases, and method.|ghg.intensity
102-9|GHG removals in the value chain|Gross removals, method, storage, permanence, reversals, and uncertainty.|ghg.removals
102-10|Carbon credits|Canceled credits, project, standard, vintage, quality, and claims.|ghg.credits
`);

    add('GRI 103: Energy 2025', 'Environmental', `
103-1|Energy policies and commitments|Energy policies, commitments, scope, targets, and responsibilities.|energy.policies
103-2|Energy consumption and self-generation|Consumption by source, purchased and self-generated energy, energy sold, methods, and factors.|energy.consumption
103-3|Upstream and downstream energy consumption|Energy outside the organization by value-chain category and method.|energy.outside
103-4|Energy intensity|Energy intensity, denominator, energy types, boundary, and method.|energy.intensity
103-5|Reductions in energy consumption|Reduction against base year or baseline, actions, scope, and method.|energy.reductions
`);

    add('GRI 201: Economic Performance 2016', 'Economic', `
201-1|Direct economic value generated and distributed|Revenue, operating costs, employee wages, capital providers, government payments, community investment, and retained value.|economic.value
201-2|Financial implications due to climate change|Climate risks and opportunities, financial implications, management methods, and costs.|climate.financialEffects
201-3|Defined benefit plan obligations|Plan liabilities, assets, strategy, participation, and retirement plans.|workforce.benefits
201-4|Financial assistance received from government|Tax relief, subsidies, grants, awards, incentives, and government shareholding by country.|government.assistance
`);

    add('GRI 202: Market Presence 2016', 'Economic', `
202-1|Entry-level wage compared to local minimum wage|Ratios by gender at significant locations and definition of significant locations.|workforce.entryWage
202-2|Senior management hired from the local community|Percentage, significant locations, senior-management definition, and local definition.|workforce.localManagement
`);

    add('GRI 203: Indirect Economic Impacts 2016', 'Economic', `
203-1|Infrastructure investments and services supported|Extent, impact, current or expected effects, and commercial, in-kind, or pro bono basis.|community.infrastructure
203-2|Significant indirect economic impacts|Examples, significance, scale, and affected context and stakeholders.|economic.indirectImpacts
`);

    add('GRI 204: Procurement Practices 2016', 'Economic', `
204-1|Proportion of spending on local suppliers|Local-supplier spending percentage, significant locations, and definition of local.|procurement.localSpend
`);

    add('GRI 205: Anti-corruption 2016', 'Economic', `
205-1|Operations assessed for corruption risks|Number and percentage of operations assessed and significant risks identified.|corruption.risks
205-2|Communication and training about anti-corruption|Communication and training by governance body, employee category, business partner, and region.|corruption.training
205-3|Confirmed incidents of corruption and actions taken|Incidents, dismissals, partner terminations, and public legal cases.|corruption.incidents
`);

    add('GRI 206: Anti-competitive Behavior 2016', 'Economic', `
206-1|Legal actions for anti-competitive behavior|Pending and completed actions and main outcomes.|competition.actions
`);

    add('GRI 207: Tax 2019', 'Economic', `
207-1|Approach to tax|Tax strategy, governance approval, regulatory compliance approach, and sustainable-development links.|tax.approach
207-2|Tax governance, control, and risk management|Governance body, controls, escalation, compliance evaluation, and assurance.|tax.governance
207-3|Stakeholder engagement on tax|Engagement with authorities, public policy, stakeholder views, and concern management.|tax.engagement
207-4|Country-by-country reporting|Entities, activities, employees, revenue, profit, assets, tax paid/accrued, and explanations by jurisdiction.|tax.countryByCountry
`);

    add('GRI 301: Materials 2016', 'Environmental', `
301-1|Materials used by weight or volume|Renewable and non-renewable materials by weight or volume.|materials.used
301-2|Recycled input materials used|Recycled input percentage using recycled and total input materials.|materials.recycledInput
301-3|Reclaimed products and packaging|Reclaimed percentage by product category using reclaimed and sold quantities.|materials.reclaimed
`);

    add('GRI 302: Energy 2016', 'Environmental', `
302-1|Energy consumption within the organization|Fuel and purchased, self-generated, and sold energy by renewable status, total, standards, and factors.|energy.consumption
302-2|Energy consumption outside the organization|Upstream and downstream energy consumption and method.|energy.outside
302-3|Energy intensity|Ratio, denominator, energy types, and boundary.|energy.intensity
302-4|Reduction of energy consumption|Reduction, energy types, base year or baseline, and method.|energy.reductions
302-5|Reductions in energy requirements of products and services|Reduction in product or service energy requirements, baseline, and method.|products.energyReduction
`);

    add('GRI 303: Water and Effluents 2018', 'Environmental', `
303-1|Interactions with water as a shared resource|Interactions, impacts, assessment, stakeholder engagement, and goals.|water.interactions
303-2|Management of water discharge impacts|Minimum discharge standards and how they were determined.|water.dischargeManagement
303-3|Water withdrawal|Withdrawal by source, freshwater status, water-stressed areas, and method.|water.withdrawal
303-4|Water discharge|Discharge by destination, freshwater status, stress area, treatment, substances, non-compliance, and method.|water.discharge
303-5|Water consumption|Consumption and storage change, including water-stressed areas and method.|water.consumption
`);

    add('GRI 305: Emissions 2016', 'Environmental', `
305-1|Direct Scope 1 GHG emissions|Gross emissions, gases, biogenic CO2, base year, factors, consolidation, and standards.|ghg.scope1
305-2|Energy indirect Scope 2 GHG emissions|Location- and market-based emissions, factors, base year, and standards.|ghg.scope2
305-3|Other indirect Scope 3 GHG emissions|Gross emissions by category, exclusions, biogenic CO2, base year, and method.|ghg.scope3
305-4|GHG emissions intensity|Intensity ratio, denominator, scopes, gases, and method.|ghg.intensity
305-5|Reduction of GHG emissions|Reduction, gases, base year or baseline, scopes, and standards.|ghg.reductions
305-6|Emissions of ozone-depleting substances|ODS in CFC-11 equivalent by substance, factors, standards, and method.|air.ods
305-7|NOx, SOx, and other significant air emissions|Emissions by pollutant, factors, standards, and method.|air.pollutants
`);

    add('GRI 306: Waste 2020', 'Environmental', `
306-1|Waste generation and significant waste-related impacts|Inputs, activities, outputs, value-chain impacts, and whether impacts occur inside or outside the organization.|waste.impacts
306-2|Management of significant waste-related impacts|Prevention, circularity, third-party management, data controls, and processes.|waste.management
306-3|Waste generated|Total waste by composition and hazardous classification, context, and method.|waste.generated
306-4|Waste diverted from disposal|Waste by recovery operation, hazardous class, on-site/off-site location, and method.|waste.diverted
306-5|Waste directed to disposal|Waste by disposal operation, hazardous class, on-site/off-site location, and method.|waste.disposed
`);

    add('GRI 306: Effluents and Waste 2016', 'Environmental', `
306-3|Significant spills|Number and volume, location, material, impacts, and remedial actions for significant spills.|spills.significant
`);

    add('GRI 308: Supplier Environmental Assessment 2016', 'Environmental', `
308-1|New suppliers screened using environmental criteria|Percentage and population of new suppliers screened.|suppliers.environmentalScreening
308-2|Negative environmental impacts in the supply chain|Suppliers assessed, significant impacts, improvements, terminations, and scope.|suppliers.environmentalImpacts
`);

    add('GRI 401: Employment 2016', 'Social', `
401-1|New employee hires and employee turnover|Counts and rates by age, gender, and region, with method.|workforce.hiresTurnover
401-2|Benefits for full-time employees|Benefits unavailable to temporary or part-time employees by significant location.|workforce.benefits
401-3|Parental leave|Entitlement, use, return, retention, and rates by gender.|workforce.parentalLeave
`);

    add('GRI 402: Labor Management Relations 2016', 'Social', `
402-1|Minimum notice periods regarding operational changes|Typical notice in weeks and collective-agreement provisions.|workforce.notice
`);

    add('GRI 403: Occupational Health and Safety 2018', 'Social', `
403-1|Occupational health and safety management system|Legal or recognized system, worker/activity/location scope, and exclusions.|safety.system
403-2|Hazard identification and incident investigation|Processes, competency, worker reporting/protection, and corrective action.|safety.hazards
403-3|Occupational health services|Functions, quality, access, and confidentiality.|safety.healthServices
403-4|Worker participation and consultation|Processes, committees, responsibilities, meeting frequency, and authority.|safety.participation
403-5|Worker training on occupational health and safety|General and hazard-specific training and coverage.|safety.training
403-6|Promotion of worker health|Access to non-occupational healthcare and voluntary health-promotion services.|safety.healthPromotion
403-7|Prevention in business relationships|Prevention and mitigation of directly linked OHS impacts.|safety.businessRelationships
403-8|Workers covered by an OHS management system|Employee and non-employee worker counts and percentages, audited/certified coverage, and exclusions.|safety.coverage
403-9|Work-related injuries|Hours, fatalities, high-consequence and recordable injuries and rates by worker type.|safety.injuries
403-10|Work-related ill health|Fatalities, recordable cases, main types and hazards, actions, and worker type.|safety.illHealth
`);

    add('GRI 404: Training and Education 2016', 'Social', `
404-1|Average training hours per employee|Average hours by gender and employee category using a consistent employee denominator.|workforce.trainingHours
404-2|Skills and transition assistance programs|Skills programmes and transition assistance for retirement or termination.|workforce.skills
404-3|Performance and career development reviews|Percentage by gender and employee category.|workforce.reviews
`);

    add('GRI 405: Diversity and Equal Opportunity 2016', 'Social', `
405-1|Diversity of governance bodies and employees|Gender, age, and other diversity percentages by governance body and employee category.|workforce.diversity
405-2|Ratio of women's to men's salary and remuneration|Basic salary and remuneration ratios by employee category and significant location.|workforce.payRatio
`);

    add('GRI 406: Non-discrimination 2016', 'Social', `
406-1|Discrimination incidents and corrective actions|Total incidents and review, remediation, result-review, and closure status.|discrimination.incidents
`);

    add('GRI 407: Freedom of Association and Collective Bargaining 2016', 'Social', `
407-1|Operations and suppliers where rights may be at risk|Risk type, operation or supplier, geography, and actions taken.|humanRights.associationRisk
`);

    add('GRI 408: Child Labor 2016', 'Social', `
408-1|Operations and suppliers at risk for child labor|Risk type, operation or supplier, geography, and measures taken.|humanRights.childLaborRisk
`);

    add('GRI 409: Forced or Compulsory Labor 2016', 'Social', `
409-1|Operations and suppliers at risk for forced labor|Risk type, operation or supplier, geography, and measures taken.|humanRights.forcedLaborRisk
`);

    add('GRI 410: Security Practices 2016', 'Social', `
410-1|Security personnel trained in human rights|Trained personnel percentage and inclusion of third-party security.|security.training
`);

    add('GRI 411: Rights of Indigenous Peoples 2016', 'Social', `
411-1|Incidents involving rights of Indigenous Peoples|Total incidents and review, remediation, result-review, and closure status.|indigenous.incidents
`);

    add('GRI 413: Local Communities 2016', 'Social', `
413-1|Operations with community engagement and programs|Percentage of operations with impact assessments, engagement, committees, consultation, programs, and grievance processes.|community.engagement
413-2|Operations with significant negative community impacts|Operation location, actual or potential status, severity, intensity, duration, and impact characteristics.|community.negativeImpacts
`);

    add('GRI 414: Supplier Social Assessment 2016', 'Social', `
414-1|New suppliers screened using social criteria|Percentage and population of new suppliers screened.|suppliers.socialScreening
414-2|Negative social impacts in the supply chain|Suppliers assessed, significant impacts, improvements, terminations, and scope.|suppliers.socialImpacts
`);

    add('GRI 415: Public Policy 2016', 'Social', `
415-1|Political contributions|Monetary and in-kind contributions by country and recipient and the in-kind valuation method.|publicPolicy.contributions
`);

    add('GRI 416: Customer Health and Safety 2016', 'Social', `
416-1|Assessment of product and service health and safety|Percentage of significant categories assessed for improvement.|products.safetyAssessment
416-2|Health and safety non-compliance incidents|Incidents resulting in fines, warnings, or voluntary-code non-compliance.|products.safetyIncidents
`);

    add('GRI 417: Marketing and Labeling 2016', 'Social', `
417-1|Product and service information and labeling|Required information and percentage of significant categories covered and assessed.|products.labeling
417-2|Information and labeling non-compliance|Incidents resulting in fines, warnings, or voluntary-code non-compliance.|products.labelingIncidents
417-3|Marketing communications non-compliance|Incidents resulting in fines, warnings, or voluntary-code non-compliance.|marketing.incidents
`);

    add('GRI 418: Customer Privacy 2016', 'Social', `
418-1|Privacy complaints and customer data losses|Substantiated complaints from outside parties and regulators and identified leaks, thefts, or losses.|privacy.incidents
`);

    const standards = [
        { id: 'gri2', title: 'GRI 2: General Disclosures 2021', effectiveFrom: '2023-01-01', universal: true },
        { id: 'gri3', title: 'GRI 3: Material Topics 2021', effectiveFrom: '2023-01-01', universal: true },
        { id: 'gri101', title: 'GRI 101: Biodiversity 2024', effectiveFrom: '2026-01-01' },
        { id: 'gri102', title: 'GRI 102: Climate Change 2025', effectiveFrom: '2027-01-01' },
        { id: 'gri103', title: 'GRI 103: Energy 2025', effectiveFrom: '2027-01-01' },
        { id: 'gri201', title: 'GRI 201: Economic Performance 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri202', title: 'GRI 202: Market Presence 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri203', title: 'GRI 203: Indirect Economic Impacts 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri204', title: 'GRI 204: Procurement Practices 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri205', title: 'GRI 205: Anti-corruption 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri206', title: 'GRI 206: Anti-competitive Behavior 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri207', title: 'GRI 207: Tax 2019', effectiveFrom: '2021-01-01' },
        { id: 'gri301', title: 'GRI 301: Materials 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri302', title: 'GRI 302: Energy 2016', effectiveFrom: '2018-07-01', supersededFrom: '2027-01-01', supersededBy: 'GRI 103' },
        { id: 'gri303', title: 'GRI 303: Water and Effluents 2018', effectiveFrom: '2021-01-01' },
        { id: 'gri305', title: 'GRI 305: Emissions 2016', effectiveFrom: '2018-07-01', partiallySupersededFrom: '2027-01-01', supersededDisclosures: ['305-1','305-2','305-3','305-4','305-5'], supersededBy: 'GRI 102' },
        { id: 'gri306w', title: 'GRI 306: Waste 2020', effectiveFrom: '2022-01-01' },
        { id: 'gri306e', title: 'GRI 306: Effluents and Waste 2016', effectiveFrom: '2018-07-01', activeDisclosures: ['306-3'] },
        { id: 'gri308', title: 'GRI 308: Supplier Environmental Assessment 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri401', title: 'GRI 401: Employment 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri402', title: 'GRI 402: Labor Management Relations 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri403', title: 'GRI 403: Occupational Health and Safety 2018', effectiveFrom: '2021-01-01' },
        { id: 'gri404', title: 'GRI 404: Training and Education 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri405', title: 'GRI 405: Diversity and Equal Opportunity 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri406', title: 'GRI 406: Non-discrimination 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri407', title: 'GRI 407: Freedom of Association and Collective Bargaining 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri408', title: 'GRI 408: Child Labor 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri409', title: 'GRI 409: Forced or Compulsory Labor 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri410', title: 'GRI 410: Security Practices 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri411', title: 'GRI 411: Rights of Indigenous Peoples 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri413', title: 'GRI 413: Local Communities 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri414', title: 'GRI 414: Supplier Social Assessment 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri415', title: 'GRI 415: Public Policy 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri416', title: 'GRI 416: Customer Health and Safety 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri417', title: 'GRI 417: Marketing and Labeling 2016', effectiveFrom: '2018-07-01' },
        { id: 'gri418', title: 'GRI 418: Customer Privacy 2016', effectiveFrom: '2018-07-01' }
    ];

    const sector14Topics = [
        ['14.1','Climate change'],['14.3','Air emissions'],['14.4','Biodiversity'],['14.5','Waste'],['14.6','Tailings'],['14.7','Water and effluents'],['14.8','Closure and rehabilitation'],['14.9','Economic impacts'],['14.10','Local communities'],['14.11','Rights of Indigenous Peoples'],['14.12','Land and resource rights'],['14.13','Artisanal and small-scale mining'],['14.14','Security practices'],['14.15','Critical incident management'],['14.16','Occupational health and safety'],['14.17','Employment practices'],['14.18','Child labor'],['14.19','Forced labor and modern slavery'],['14.20','Freedom of association and collective bargaining'],['14.21','Non-discrimination and equal opportunity'],['14.22','Anti-corruption'],['14.23','Payments to governments'],['14.24','Public policy'],['14.25','Conflict-affected and high-risk areas']
    ].map(([id,title]) => ({ id, title }));

    const sector14Recommendations = [
        ['14.0.1','Mine-site disclosure','List owned or operated mine sites, define mine site, and report each site name, country, coordinates, and area in hectares.'],
        ['14.6.2','Tailings disposal methods','Report the tailings disposal methods used.'],
        ['14.6.3','Tailings facilities','Report facility name, location, ownership/operator status, standard commitments, construction, status, capacity, stored weight, consequence classification, risk assessments, and independent review.'],
        ['14.8.4','Closure and rehabilitation status','For each mine site, report whether a plan exists and whether closure, rehabilitation, or completed rehabilitation applies.'],
        ['14.8.5','Closure plan approval and review','For each closure and rehabilitation plan, report authority approval and recent and next review dates.'],
        ['14.8.6','Land disturbed and rehabilitated','For each mine site, report hectares disturbed and not rehabilitated and hectares rehabilitated.'],
        ['14.8.7','Estimated life of mine','For each mine site, report estimated life of mine.'],
        ['14.8.8','Financial provisions for closure','Report closure cost, provision coverage, regulatory alignment, calculation method, and financial instruments by mine site.'],
        ['14.9.6','Local employment','Report mine-site percentages of workers hired locally by gender and define local community.'],
        ['14.10.4','Community grievances','For each mine site, report grievance counts and types and percentages addressed, resolved, and resolved through remediation.'],
        ['14.11.3','Operations affecting Indigenous Peoples','List operations and proven reserves where Indigenous Peoples are present and may be affected.'],
        ['14.11.4','Free, prior, and informed consent','For each FPIC process, report mutual acceptance and whether an agreement was reached and published.'],
        ['14.12.2','Involuntary resettlement','List affected mine sites and report displaced persons by gender and effects on and restoration of livelihoods and human rights.'],
        ['14.12.3','Land and resource rights violations','List locations with conflicts or violations and describe incidents and affected stakeholders.'],
        ['14.13.2','Mine sites where ASM is present','List mine sites where artisanal and small-scale mining occurs on or near the site.'],
        ['14.13.3','Incidents involving ASM','Report incident count and nature and actions taken.'],
        ['14.15.3','Critical incidents','Report incident count, impacts, and remediation actions.'],
        ['14.15.4','Emergency preparedness plans','Report the percentage of mine sites with response plans and list sites without plans.'],
        ['14.20.3','Strikes and lockouts','Report qualifying strikes and lockouts and total worker-days idle.'],
        ['14.22.5','Contract transparency','Describe publication of contracts and licenses or reasons and future actions when they are not public.'],
        ['14.22.6','Beneficial ownership','Report owner identity, nationality, residence, political exposure, ownership level, and means of control, including joint ventures.'],
        ['14.23.8','State mineral purchases','Report mineral volumes and types, selling entity, payment recipient, and payments for state mineral purchases.']
    ].map(([id,title,requirement]) => ({ id, title, requirement }));

    const sector14ReferencesById = {
        '102-1':['14.1.2'],'102-2':['14.1.3'],'102-3':['14.1.4'],'102-4':['14.1.5'],'102-5':['14.1.6'],'102-6':['14.1.7'],'102-7':['14.1.8'],'102-8':['14.1.9'],'102-9':['14.1.10'],'102-10':['14.1.11'],
        '103-1':['14.1.12'],'103-2':['14.1.13'],'103-3':['14.1.14'],'103-4':['14.1.15'],'305-7':['14.3.2'],
        '101-1':['14.4.2'],'101-2':['14.4.3'],'101-4':['14.4.4'],'101-5':['14.4.5'],'101-6':['14.4.6'],'101-7':['14.4.7'],'101-8':['14.4.8'],
        '306-1':['14.5.2'],'306-2':['14.5.3'],'306-3':['14.5.4','14.15.2'],'306-4':['14.5.5'],'306-5':['14.5.6'],
        '303-1':['14.7.2'],'303-2':['14.7.3'],'303-3':['14.7.4'],'303-4':['14.7.5'],'303-5':['14.7.6'],
        '402-1':['14.8.2','14.17.6'],'404-2':['14.8.3','14.17.8'],'201-1':['14.9.2','14.23.2'],'203-1':['14.9.3'],'203-2':['14.9.4'],'204-1':['14.9.5'],
        '413-1':['14.10.2'],'413-2':['14.10.3'],'411-1':['14.11.2'],'410-1':['14.14.2'],
        '403-1':['14.16.2'],'403-2':['14.16.3'],'403-3':['14.16.4'],'403-4':['14.16.5'],'403-5':['14.16.6'],'403-6':['14.16.7'],'403-7':['14.16.8'],'403-8':['14.16.9'],'403-9':['14.16.10'],'403-10':['14.16.11'],
        '202-1':['14.17.2'],'401-1':['14.17.3'],'401-2':['14.17.4'],'401-3':['14.17.5','14.21.3'],'404-1':['14.17.7','14.21.4'],'414-1':['14.17.9','14.18.3','14.19.3'],'414-2':['14.17.10'],
        '408-1':['14.18.2'],'409-1':['14.19.2'],'407-1':['14.20.2'],'202-2':['14.21.2'],'405-1':['14.21.5'],'405-2':['14.21.6'],'406-1':['14.21.7'],
        '205-1':['14.22.2'],'205-2':['14.22.3'],'205-3':['14.22.4'],'201-4':['14.23.3'],'207-1':['14.23.4'],'207-2':['14.23.5'],'207-3':['14.23.6'],'207-4':['14.23.7'],'415-1':['14.24.2']
    };

    const sector14References = {};
    Object.entries(sector14ReferencesById).forEach(([id, references]) => {
        disclosures.filter(disclosure => disclosure.id === id).forEach(disclosure => {
            sector14References[disclosure.key] = references;
        });
    });
    sector14References['GRI 306: Waste 2020:306-3'] = ['14.5.4'];
    sector14References['GRI 306: Effluents and Waste 2016:306-3'] = ['14.15.2'];

    const sharedFieldMap = {
        g_revenue:['GRI 201: Economic Performance 2016:201-1'],
        g_fte:['GRI 2: General Disclosures 2021:2-7','GRI 2: General Disclosures 2021:2-21','GRI 404: Training and Education 2016:404-1'],
        g_hours:['GRI 403: Occupational Health and Safety 2018:403-9'],
        nrg_ren:['GRI 302: Energy 2016:302-1','GRI 302: Energy 2016:302-3','GRI 103: Energy 2025:103-2','GRI 103: Energy 2025:103-4'],
        nrg_non:['GRI 302: Energy 2016:302-1','GRI 302: Energy 2016:302-3','GRI 103: Energy 2025:103-2','GRI 103: Energy 2025:103-4'],
        wst_gen:['GRI 306: Waste 2020:306-3'],
        wst_rec:['GRI 306: Waste 2020:306-4'],
        wst_disp:['GRI 306: Waste 2020:306-5'],
        saf_lti:['GRI 403: Occupational Health and Safety 2018:403-9'],
        div_wage_f:['GRI 405: Diversity and Equal Opportunity 2016:405-2'],
        div_wage_t:['GRI 405: Diversity and Equal Opportunity 2016:405-2'],
        inc_msme:['GRI 204: Procurement Practices 2016:204-1'],
        inc_totalpur:['GRI 204: Procurement Practices 2016:204-1'],
        fair_cust_breach:['GRI 418: Customer Privacy 2016:418-1'],
        fair_tot_breach:['GRI 418: Customer Privacy 2016:418-1'],
        open_rp:['GRI 201: Economic Performance 2016:201-1']
    };

    return { disclosures, standards, sector14Topics, sector14Recommendations, sector14References, sharedFieldMap };
}));
