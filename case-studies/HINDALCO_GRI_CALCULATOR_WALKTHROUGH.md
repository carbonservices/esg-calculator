# From annual report to GRI readiness: the Hindalco FY 2024-25 walkthrough

This walkthrough turns Hindalco Industries Limited's FY 2024-25 Integrated Annual Report into a reproducible calculator workspace. It shows where the inputs came from, what the calculator derives, and why the final result is an internal **GRI Readiness Index of 58.2/100** rather than an official GRI score.

Use [`HINDALCO_2024-25_GRI_PROJECT.json`](HINDALCO_2024-25_GRI_PROJECT.json) as the import-ready calculator workspace. This guide includes the scoring method, weights, formulas, compliance gates, evidence rationale, and report-page references needed to understand the case.

The source annual-report PDF and the internal standards-review working paper are intentionally not bundled in this repository. Obtain the FY 2024-25 Integrated Annual Report from Hindalco's official reporting channel before reperforming or updating the assessment.

The assessment is a desk review of public evidence. It is not an audit, assurance conclusion, GRI certification, or rating issued by GRI. Under the GRI Standards, the formal output is a Content Index and an applicable statement of use—not a numeric score.

## Load the case into the calculator

1. Open [`index.html`](../index.html) and select **Go to workspace**.
2. Open the BRSR **Global Dashboard** or the GRI **Overview**. The same JSON controls appear beside the PDF/export controls in both frameworks.
3. Select **Load JSON** and choose `HINDALCO_2024-25_GRI_PROJECT.json`.
4. The calculator creates and activates a separate workspace named **Hindalco FY 2024-25 GRI Assessment**. It does not overwrite the workspace already open.
5. Confirm that the framework selector shows **GRI** and the reporting year is **2025**.
6. Walk through **Overview**, **Reporting Setup**, **Material Topics**, **Metrics**, **Disclosures**, and **Content Index**.
7. Return to **Overview** and select **Run Validation**. Treat the resulting actions independently from the numeric readiness score.

The imported snapshot uses 1 April 2024 to 31 March 2025 as the reporting period. The publication date is set to 30 July 2025 from the PDF creation metadata because the report text reviewed did not provide a clearer publication date. Confirm that date against the issuer's publication record before relying on edition validation.

## What the JSON contains

The file loads the exact base-case population used in the assessment:

| Layer | Imported population | Purpose |
|---|---:|---|
| GRI 2 and GRI 3 disclosure rows | 32 | Universal reporting requirements |
| Material-topic management rows | 21 | Hindalco topics M1-M21, including one 3-3 assessment per topic |
| Environmental Topic Standard rows | 35 | Biodiversity, materials, energy, water, emissions, waste, and supplier environmental assessment |
| Economic Topic Standard rows | 17 | Economic value, market presence, indirect impacts, procurement, anti-corruption, competition, and tax |
| Social Topic Standard rows | 36 | Employment, labor relations, safety, training, equality, human rights, communities, suppliers, products, and privacy |
| **Total scored rows** | **141** | Denominator of the internal readiness calculation |

GRI 102: Climate Change 2025, GRI 103: Energy 2025, and GRI 306: Effluents and Waste 2016 are not selected because the base assessment uses the editions applicable to the report and GRI 306: Waste 2020. GRI 101: Biodiversity 2024 and GRI 14 are retained as the editions presented or apparently adopted by the report.

The **Documented early adoption** switch is deliberately off. The report appears to use standards that were not yet effective for this reporting period, but the review did not find an explicit early-adoption basis. This allows the calculator to surface the edition warning instead of silently accepting the choice.

Hindalco's M1-M21 topics are loaded under **Organization-defined material topics**. The GRI 14 topics remain at **Review required** because the published index does not provide a clean, reproducible reconciliation between its M1-M23 matrix and the current GRI 14 V1.1 topic structure. This preserves the 141-row score population without double-counting a topic under both names, while intentionally leaving the Sector Standard compliance gate unresolved.

## The model embedded in this case

The GRI Standards do not prescribe a numeric GRI score. The calculator therefore keeps an internal readiness model separate from the formal GRI compliance decision.

Material topics begin with impacts, not with a desired score. For optional internal triage, normalize each expert rating from 0-5 to 0-1. Negative-impact severity can be estimated as `0.40 × scale + 0.30 × scope + 0.30 × irremediability`; an actual negative impact scores `100 × severity`, while a potential negative impact scores `100 × severity^0.70 × likelihood^0.30`. Positive-impact magnitude can be estimated as `0.60 × scale + 0.40 × scope`, with the same likelihood treatment for a potential impact. A topic takes the maximum score among its impacts, with `60/100` as a configurable review threshold. Severe human-rights impacts at or above `0.80` severity go to expert review regardless of likelihood, and every applicable Sector Standard topic must be reviewed. These factors are internal decision aids, not GRI-prescribed formulas; stakeholder evidence, expert judgment, and a written rationale remain necessary.

For each applicable disclosure, completeness `C` is the weighted fraction of required subrequirements answered:

`C_d = Σ(requirement weight × completion) ÷ Σ(requirement weight)`

Quality `Q` is a 0-1 judgment assembled from source evidence 25%, boundary completeness 20%, method transparency 20%, consistency 15%, review and controls 10%, and timeliness 10%:

`Q_d = Σ(quality-factor weight × factor score)`

Base disclosure readiness is:

`R_d = 100 × C_d × Q_d`

The optional evidence-relevance factor `E` can be enabled for sensitivity testing, producing `100 × C × Q × E`. It is an internal good-to-have control, not an industry-standard or GRI-prescribed factor, and it is disabled in this case.

The overall readiness index is:

`GRI-RI = Σ(W_d × R_d) ÷ Σ(W_d)`

The imported weights are Universal `1.00`, Crucial `1.85`, Significant `1.65`, and Low `1.35`. They express internal review priority, not requirements from GRI. Approved not-applicable rows are excluded; legal-prohibition, confidentiality, and unavailable-information omissions receive configurable completeness defaults of `0.50`, `0.25`, and `0.00`. An unsupported or prohibited omission fails compliance regardless of its numeric effect.

Internal interpretation is 90-100 publication-ready only if all compliance gates pass, 75-89 targeted gaps, 50-74 material completeness or data-quality gaps, and 0-49 not ready. A high number can never cure a failed mandatory requirement.

The nine hard gates mirror the calculator:

1. Apply and evidence the reporting principles.
2. Complete every required GRI 2 disclosure or record a permitted omission.
3. Determine material topics using every applicable Sector Standard and document the process.
4. Complete GRI 3 and a Disclosure 3-3 management response and location for every material topic.
5. Complete relevant Topic and Sector disclosures using editions effective for the publication date.
6. Use only permitted omission reasons with every required explanation, action, and timeframe.
7. Prepare a Content Index with valid topic links, locations, omission details, and Sector references.
8. Confirm the exact statement of use, organization name, and valid reporting period.
9. Notify GRI and retain verification of that notification.

All nine must pass before the workspace can support an “in accordance” conclusion. They are evaluated independently from the 58.2 readiness score.

## Start with the metric workspace

The metric cards calculate operational values. They do not directly determine the 58.2 readiness score; that score comes from disclosure completeness and evidence quality. The metrics are still essential because they expose unit, boundary, denominator, and reconciliation problems that affect those judgments.

### Greenhouse-gas emissions

Source: printed pp. 160-161, PDF p. 82.

| Calculator input | Report value | Imported value |
|---|---:|---:|
| Scope 1 | 28.71 million tCO2e | 28,710,000 tCO2e |
| Scope 2, location-based | 1.30 million tCO2e | 1,300,000 tCO2e |
| Scope 3 | 14.12 million tCO2e | 14,120,000 tCO2e |
| Scope 2, market-based | Not separately established | Blank |
| Intensity denominator | No consolidated denominator aligned to all three scopes | Blank |

The calculator produces:

`Operational emissions = Scope 1 + location-based Scope 2`

`= 28,710,000 + 1,300,000 = 30,010,000 tCO2e`

`Gross emissions = Scope 1 + location-based Scope 2 + Scope 3`

`= 28,710,000 + 1,300,000 + 14,120,000 = 44,130,000 tCO2e`

The report's stated Scope 1 and 2 total is therefore reproduced exactly. An intensity is intentionally not calculated. Hindalco reports an India-only turnover intensity and a separate Novelis product intensity; applying either denominator to the consolidated 44.13 million tCO2e numerator would mix boundaries.

### Energy balance

Source: printed pp. 156-157, PDF p. 80.

All source values are reported in million GJ and are multiplied by 1,000,000 for entry:

| Calculator input | Imported GJ |
|---|---:|
| Fossil/non-renewable fuel | 308,140,000 |
| Renewable source | 2,130,000 |
| Purchased electricity | 13,390,000 |
| Purchased heating, cooling, steam and other energy | 310,000 |
| Self-generated renewable energy | 0 |
| Energy sold | 1,430,000 |

The zero for self-generated renewable energy does not assert that Hindalco generated none. It prevents the report's single renewable-energy total from being counted twice.

`Net energy = 308,140,000 + 2,130,000 + 13,390,000 + 310,000 + 0 − 1,430,000`

`= 322,540,000 GJ`

This exactly reproduces the report's 322.54 million GJ total. The intensity denominator remains blank because the report's 2,778 GJ/₹ crore figure is for Hindalco India, while this energy balance includes Novelis.

### Water: a useful reconciliation warning

Sources: printed pp. 168-173, PDF pp. 86-88.

This group uses a Hindalco India boundary so the water-stress numerator and total withdrawal share are comparable. One million cubic metres equals 1,000 ML.

| Calculator input | Imported value |
|---|---:|
| Total withdrawal | 83.32 million m3 = 83,320 ML |
| Total discharge | 0.033 million m3 = 33 ML |
| Withdrawal from water-stressed areas | 7.03 million m3 = 7,030 ML |

The calculator derives:

`Water-stress share = 7,030 ÷ 83,320 × 100 = 8.44%`

This agrees with the report's rounded 8.4% statement. It also derives:

`Water consumption = 83,320 − 33 = 83,287 ML`

The report states Hindalco India consumption of 81.53 million m3, or 81,530 ML. The difference is:

`83,287 − 81,530 = 1,757 ML`

Do not adjust an input merely to suppress this difference. It is a reconciliation question: the withdrawal, discharge, and consumption tables may use different inclusions, timing, or treatment of recycled water. The reporting team should document the bridge.

### Waste: preserve the inconsistency instead of forcing a balance

Source: printed pp. 178-179, PDF p. 91.

The report's non-hazardous and hazardous tables give:

- Generated: `12.779 + 0.586 = 13.365 million tonnes`
- Recycled/reused: `10.904 + 0.512 = 11.416 million tonnes`
- Landfill/TSDF: `0.025 + 0.164 = 0.189 million tonnes`
- Stored in approved structures: `2.974 million tonnes`
- Incinerated: `0.002 + 0.003 = 0.005 million tonnes`

The calculator therefore shows:

`Diversion rate = 11.416 ÷ 13.365 × 100 = 85.42%`

`Hazardous share = 0.586 ÷ 13.365 × 100 = 4.38%`

These agree with the report's rounded 85% diversion headline. The route reconciliation does not agree:

`11.416 + 0.189 + 2.974 + 0.005 = 14.584 million tonnes`

`Variance = 13.365 − 14.584 = −1.219 million tonnes`

The JSON records storage as “other disposal” only to make the published categories visible. The resulting validation error is intentional. It tells the reviewer to establish whether stored material is a period-end stock, a treatment route, legacy material, or a differently bounded flow before using it in a GRI 306 reconciliation.

### Occupational injury rates

Source: printed pp. 96-97, PDF p. 50.

The report separates employees and contractual workers, so the calculator does the same and uses a one-million-hour rate base:

`Employee TRIFR = 122 ÷ 79,945,359 × 1,000,000 = 1.526 ≈ 1.53`

`Contractual-worker TRIFR = 130 ÷ 119,231,772 × 1,000,000 = 1.090 ≈ 1.09`

Both results reproduce the published rates. This is the strongest kind of metric evidence: numerator, denominator, unit, population, and formula are all visible.

### Economic value generated and distributed

Source: printed pp. 66-67, PDF p. 35. Values remain in ₹ crore.

| Component | Report value |
|---|---:|
| Direct economic value generated | 241,204 |
| Operating costs | 159,345 |
| Depreciation and other expense | 39,831 |
| Employee wages and benefits | 15,406 |
| Payments to providers of capital | 4,002 |
| Payments to government | 6,354 |
| Community investments | 186 |

The calculator currently has one operating-cost input, so the JSON transparently combines the first two expense lines:

`Combined operating-cost input = 159,345 + 39,831 = 199,176`

`Calculated distributed value = 199,176 + 15,406 + 4,002 + 6,354 + 186 = 225,124`

`Calculated retained value = 241,204 − 225,124 = 16,080`

The report prints distributed value of 225,123 and retained value of 16,081. The one-crore difference is consistent with rounded displayed components, but it should remain visible as a reconciliation item rather than being silently forced to the reported total.

### Why workforce and supplier cards remain blank

Blank is not zero.

The workforce card needs an employee count, employees covered by collective bargaining, training hours for the same population, and comparable women/men remuneration values. The report provides useful figures, including 10,981 Hindalco India employees, 13,725 Novelis employees, 3,610,506 Hindalco India training hours, 223,485 Novelis training hours, and 42.22% workforce collective-bargaining coverage. Those figures do not form one consistently bounded employee-only calculation, so the JSON does not manufacture a result.

The supplier card has the same issue. The report says all new suppliers were screened, but it does not give the absolute number of new suppliers. The figures for 142 significant suppliers, 125 detailed assessments, 895 broader assessments, and 12 corrective-action plans describe different populations. None is substituted for the missing new-supplier denominator.

## How the 58.2 readiness score is calculated

For every disclosure or material-topic row `d`, the base readiness is:

`R_d = 100 × C_d × Q_d`

where:

- `C` is the estimated fraction of required subrequirements answered.
- `Q` is evidence quality, considering source evidence, boundary, method transparency, consistency, controls, and timeliness.
- `W` is the configured importance weight: `1.00` for Universal, `1.85` for crucial topics, and `1.65` for significant topics.

The overall result is:

`GRI-RI = Σ(W_d × R_d) ÷ Σ(W_d)`

For example, GRI 305-1 has `C = 0.95`, `Q = 0.90`, and `W = 1.85`:

`R_305-1 = 100 × 0.95 × 0.90 = 85.5`

`Weighted points = 1.85 × 85.5 = 158.175`

The `Q = 0.90` judgment can be read through the documented quality rubric:

| Quality test | Weight | Evidence rating | Contribution |
|---|---:|---:|---:|
| Source evidence | 25% | 1.00 | 0.250 |
| Boundary completeness | 20% | 0.75 | 0.150 |
| Method transparency | 20% | 0.75 | 0.150 |
| Consistency | 15% | 1.00 | 0.150 |
| Review and controls | 10% | 1.00 | 0.100 |
| Timeliness | 10% | 1.00 | 0.100 |
| **Quality total** | **100%** |  | **0.900** |

This recognizes the direct, current emissions table and assurance/control evidence while discounting incomplete detail on gases, consolidation, factors, and biogenic CO2. The `C = 0.95` value similarly indicates that nearly all required content is present, with a small completeness deduction for those omissions.

At the other end, GRI 207-4 has `C = 0.10`, `Q = 0.40`, and `W = 1.85` because the cited pages do not provide the required country-by-country tax data:

`R_207-4 = 100 × 0.10 × 0.40 = 4.0`

`Weighted points = 1.85 × 4.0 = 7.4`

Here, `C = 0.10` gives limited credit for related tax information but recognizes that the country-by-country requirements are absent. A reproducible `Q = 0.40` interpretation is `0.25 × 0.25 + 0.20 × 0.25 + 0.20 × 0.25 + 0.15 × 0.75 + 0.10 × 0.75 + 0.10 × 0.50 = 0.40`. These component judgments are review assumptions, not measurements supplied by Hindalco.

The complete roll-up is:

| Score block | Rows | Weight | Weighted points | Readiness |
|---|---:|---:|---:|---:|
| GRI 2 General Disclosures | 30 | 30.00 | 1,846.50 | 61.5 |
| GRI 3 plus M1-M21 management | 23 | 39.85 | 2,439.71 | 61.2 |
| Environmental Topic Standards | 35 | 64.75 | 3,785.10 | 58.5 |
| Economic Topic Standards | 17 | 31.05 | 1,346.06 | 43.4 |
| Social Topic Standards | 36 | 64.20 | 3,968.13 | 61.8 |
| **Total** | **141** | **229.85** | **13,385.50** | **58.2** |

`13,385.50 ÷ 229.85 = 58.2358`, displayed as **58.2**.

On the calculator's category chart, GRI 2, GRI 3, and the material-topic management rows are combined under **Universal**, so that bar appears as approximately **61.4**. The standard-by-standard table preserves the more detailed split above.

The optional evidence-relevance factor is disabled in this case. It is an internal sensitivity control, not a GRI-prescribed factor. Turning it on would multiply each row by `E`, but it must not be used to convert a failed compliance gate into a pass.

To test assumptions, use **Reporting Setup → Internal readiness configuration** for the four priority weights, and the `C`, `Q`, and optional `E` controls on each material-topic or disclosure record. The dashboard recalculates automatically. A row's status drives validation, while `C`, `Q`, and `W` drive the numeric score; changing either side should therefore be documented and reviewed separately.

## Read the score and validation together

The 58.2 result means the public evidence has material completeness or data-quality gaps. It does not mean “58.2% GRI compliant.”

Select **Run Validation** on the GRI Overview after loading the JSON. The imported case is expected to remain unready for an “in accordance” conclusion because, among other issues:

The current snapshot reports **1 metric action** and **8 readiness actions**. The metric action is the waste reconciliation described above; the readiness actions correspond to the failed GRI 1 gates.

- GRI 101-3 and 302-5 contain unsupported omissions.
- The applicable GRI 14 review and M1-M23 reconciliation are incomplete.
- GRI 207 evidence does not satisfy the tax disclosures.
- Several content-index locations and sector references are inaccurate.
- The assurance boundary is narrower than the report boundary.
- GRI notification cannot be verified from the public report.
- The waste figures do not reconcile in the metric workspace.

That separation is deliberate: the numeric readiness score helps prioritize work, while the nine GRI 1 gates determine whether the reporting package is ready to support its statement of use.

## A practical review sequence

For the clearest guided review:

1. In **Overview**, note the 58.2 readiness result and failed gates.
2. In **Metrics**, reproduce the GHG, energy, water, waste, safety, and economic calculations above.
3. In **Material Topics**, compare M1-M21 with the unresolved GRI 14 topic review.
4. In **Disclosures**, filter first to `missing` or `omitted`, then inspect GRI 207, GRI 101, GRI 302, and GRI 403.
5. In **Content Index**, compare printed pages with PDF pages and inspect material-topic and sector-reference links.
6. Correct only from verified evidence, rerun validation, and export a new JSON snapshot so every judgment remains reviewable.

The fastest path to a better result is not to tune the weights. It is to correct unsupported omissions, repair index mappings, reconcile boundaries and totals, and publish the missing evidence that makes `C` and `Q` reproducible.
