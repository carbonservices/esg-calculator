# From BRSR filing to calculator dashboard: Tata Steel FY 2025-26

This walkthrough turns Tata Steel Limited's FY 2025-26 Business Responsibility and Sustainability Report into a reproducible BRSR calculator workspace. It explains every imported figure, conversion, calculated result, and deliberate blank.

Use [`TATA_STEEL_2025-26_BRSR_PROJECT.json`](TATA_STEEL_2025-26_BRSR_PROJECT.json) with the calculator. The source PDF is not bundled in this repository. Page references identify both the page printed in the report and the 1-based PDF page. The filing identifies the issuer's public copy as <https://www.tatasteel.com/media/25901/brsr.pdf>.

This is a worked example, not an assurance opinion. The source states that Price Waterhouse & Co Chartered Accountants LLP performed reasonable assurance over specified FY 2025-26 standalone BRSR Core indicators. The exact scope and exclusions remain those in the source report.

## Load the case

1. Open [`index.html`](../index.html), choose **Go to workspace**, and select **BRSR**.
2. Open **Global Dashboard** and choose **Load JSON** beside **Export PDF**.
3. Select `TATA_STEEL_2025-26_BRSR_PROJECT.json`.
4. Confirm the new workspace is **Tata Steel FY 2025-26 BRSR Core Case Study** and the year is **2026**.
5. Review each section below, then return to **Global Dashboard** and select **Run Validation**.

Import creates a separate workspace and does not replace the currently open one.

## Why the standalone boundary is used

The report presents many indicators for both Tata Steel Standalone and Tata Steel Consolidated. The JSON consistently uses the FY 2025-26 standalone column because that is the boundary over which the report describes reasonable assurance for the selected BRSR Core indicators. Mixing a consolidated numerator with a standalone denominator would make an apparently precise but invalid ratio.

The shared revenue input is the reported standalone total revenue of ₹1,39,720.22 crore on printed p. 142 / PDF p. 6:

`₹1,39,720.22 crore × ₹10,000,000 per crore = ₹1,397,202,200,000`

The report's environmental intensity tables refer to revenue from operations. The calculator uses the disclosed total-revenue figure available in this BRSR document, so its unrounded intensities are cross-checks that reproduce the published rounded values, not replacements for the issuer's calculation workpapers.

## GHG footprint

Source: Principle 6, Essential Indicator 7, printed p. 184 / PDF p. 48.

| Input | Report value | Calculator value |
|---|---:|---:|
| Scope 1 | 64 million tCO2e | 64,000,000 tCO2e |
| Scope 2, location-based | 5 million tCO2e | 5,000,000 tCO2e |

Each row uses a custom factor of `1 tCO2e per entered unit`. This is a direct unit conversion, not an emissions-factor estimate:

`Total GHG = 64,000,000 + 5,000,000 = 69,000,000 tCO2e`

`Intensity = 69,000,000 ÷ 1,397,202,200,000 = 0.0000493844 tCO2e/₹`

The dashboard scales that value by one million for its comparison chart:

`0.0000493844 × 1,000,000 = 49.3844 tCO2e/₹ million`

In the report's unit this is `0.000493844 million tCO2e/₹ crore`, which rounds to the published `0.0005`.

## Water footprint

Sources: Principle 6, Essential Indicators 3 and 4, printed pp. 182-183 / PDF pp. 46-47.

One million litres equals 1,000 kilolitres. The imported withdrawal rows are:

| Source | Million litres | Imported kL |
|---|---:|---:|
| Surface water | 66,296 | 66,296,000 |
| Groundwater | 10,250 | 10,250,000 |
| Third-party water | 18,539 | 18,539,000 |
| Others | 15,538 | 15,538,000 |
| **Total withdrawal** | **110,623** | **110,623,000** |

Discharge is `11,337 + 231 = 11,568 million litres`, entered as `11,568,000 kL`.

`Water consumed = withdrawal − discharge`

`= 110,623,000 − 11,568,000 = 99,055,000 kL`

`Water intensity = 99,055,000 ÷ 1,397,202,200,000`

`= 0.0000708953 kL/₹`, which rounds to the published `0.000071`.

This exact reconciliation is useful: the reported withdrawal, discharge, and consumption share one boundary and unit.

## Energy footprint

Source: Principle 6, Essential Indicator 1, printed p. 181 / PDF p. 45. The case uses the report's secondary-energy column.

| Input | Report value | Imported value |
|---|---:|---:|
| Renewable energy | 1.51 PJ | 1,510,000 GJ |
| Non-renewable energy | 622.30 PJ | 622,300,000 GJ |

`Total energy = 1,510,000 + 622,300,000 = 623,810,000 GJ`

`Renewable share = 1,510,000 ÷ 623,810,000 × 100 = 0.24206%`

This rounds to the report's `0.24%`.

`Energy intensity = 623,810,000 ÷ 1,397,202,200,000`

`= 0.000446471 GJ/₹ = 446.471 GJ/₹ million`

That is `0.00446471 PJ/₹ crore`, which rounds to the report's `0.0045`.

## Waste management and the intentional warning

Source: Principle 6, Essential Indicator 9, printed p. 185 / PDF p. 49.

| Input | Imported tonnes |
|---|---:|
| Waste generated | 18,782,249 |
| Waste recycled, reused, or otherwise recovered | 18,842,244 |
| Waste disposed | 21,909 |

The report explains that recovered and disposed waste exceeds generated waste because legacy stock from earlier periods was processed in FY 2025-26. The calculator therefore flags both the recovery percentage and period-flow reconciliation:

`18,842,244 + 21,909 − 18,782,249 = 81,904 tonnes above current-year generation`

Do not reduce recovery or disposal to clear these alerts. A reporting workflow should instead add an opening-stock bridge and preserve the source values. The current dashboard intentionally makes this cross-period limitation visible.

The independent intensity cross-check remains valid:

`18,782,249 ÷ 1,397,202,200,000 = 0.0000134428 tonnes/₹`

This rounds consistently with the report's `0.000013`.

## Employee well-being and safety

Sources: Principle 3, Essential Indicators 1(c) and 11, printed pp. 162 and 168 / PDF pp. 26 and 32.

The report publishes well-being cost as `0.19%` of total revenue but not the underlying rupee amount in this BRSR. The case derives a reversible input from the reported percentage and shared revenue:

`Implied well-being spend = ₹1,397,202,200,000 × 0.19 ÷ 100`

`= ₹2,654,684,180`

The calculator then returns:

`₹2,654,684,180 ÷ ₹1,397,202,200,000 × 100 = 0.19%`

The application uses total revenue as the denominator because that is the BRSR Core formula. It does not divide by employee-benefit expense.

Tata Steel reports standalone LTIFR of `0.49` for employees and `0.36` for workers. The calculator needs lost-time injury counts and matching hours:

`LTIFR = lost-time injuries ÷ hours worked × 1,000,000`

Those components are not disclosed in the BRSR table, so both fields remain blank. Reverse-engineering a convenient numerator or combining employee and worker rates would obscure the population and is not audit-ready.

## Gender diversity

Sources: Principle 5, Essential Indicators 3(b) and 7, printed pp. 177-178 / PDF pp. 41-42.

Tata Steel reports:

- Gross wages paid to females: `7%` of total wages.
- Standalone POSH complaints filed: `33`.

The report does not disclose the two wage amounts in this table. The JSON therefore uses a documented ratio-equivalent pair, `7 ÷ 100 × 100 = 7%`. These are ratio units, not rupee claims. The `caseStudy.ratioEquivalentInputs` block in the JSON preserves that qualification through re-export.

## Inclusive development

Source: Principle 8, Essential Indicators 4 and 5, printed p. 193 / PDF p. 57.

MSME sourcing is reported as `11%`. The imported ratio-equivalent pair is `11/100`.

For the dashboard's **Small Town Wages** indicator, the case treats rural and semi-urban locations as smaller towns:

`0.03% rural + 19.31% semi-urban = 19.34%`

The imported pair is therefore `19.34/100`. Urban and metropolitan wages are not included in this numerator. If an organization's policy defines “smaller town” differently, change the numerator and document the classification.

## Fairness in engagement

Sources: Principle 1, Essential Indicator 8, printed p. 156 / PDF p. 20; Principle 9, Essential Indicator 7, printed p. 197 / PDF p. 61.

The report provides days payable outstanding directly:

`DPO = accounts payable ÷ cost of goods/services procured × 365 = 94 days`

It does not provide both monetary components in this BRSR. The fixture uses the algebraically equivalent pair `94/365`, so the calculator gives:

`94 ÷ 365 × 365 = 94 days`

These are ratio-equivalent units, not reported rupee balances.

The report shows no data breaches and no customer-PII breaches. A percentage with a zero total has no valid denominator, so the JSON leaves both breach fields blank rather than presenting `0 ÷ 0` as zero percent.

## Openness of business

Source: Principle 1, Essential Indicator 9, printed p. 156 / PDF p. 20.

The report gives top-ten dealers/distributors as `29%` of dealer/distributor sales. The case loads `29/100` as a ratio-equivalent pair.

Related-party shares are reported separately: purchases `39%`, sales `14%`, loans and advances `2%`, and investments `98%`. The current dashboard has one related-party ratio, so the fixture uses purchases, `39/100`, and does not average unlike categories. The other three remain report evidence outside this single chart card.

## What the dashboard should show

After import, the FY 2026 workspace should calculate:

| Dashboard output | Expected value |
|---|---:|
| Total GHG | 69,000,000 tCO2e |
| GHG intensity | 0.00004938 tCO2e/₹ |
| Water consumed | 99,055,000 kL |
| Water intensity | 0.00007090 kL/₹ |
| Total energy | 623,810,000 GJ |
| Renewable energy | 0.24% |
| Energy intensity | 0.00044647 GJ/₹ |
| Waste intensity | 0.00001344 tonnes/₹ |
| Well-being spend | 0.19% of revenue |
| Female wage share | 7.00% |
| MSME sourcing | 11.00% |
| Rural plus semi-urban wages | 19.34% |
| Days payable outstanding | 94 days |
| Top-ten dealer concentration | 29.00% |
| Related-party purchases | 39.00% |

**Run Validation** should retain the two waste actions. Every other populated calculation should resolve without a calculation error. LTIFR and breach share remain unavailable by design.

## How to use this case in a real reporting cycle

The JSON demonstrates the calculator's arithmetic and boundary discipline; it is not a substitute for source workpapers. For an auditable live workspace:

1. Select one boundary and reporting period before entering values.
2. Enter raw numerators and denominators whenever they exist. Use ratio-equivalent inputs only for a transparent reproduction exercise.
3. Preserve units before conversion: crore to rupees, PJ to GJ, million litres to kL, and million tonnes to tonnes.
4. Keep factor source, version, geography, year, and units with every GHG row.
5. Reconcile stocks and flows rather than editing reported waste totals to make them balance.
6. Leave unavailable results blank. Zero is a measured value, not a synonym for “not disclosed.”
7. Run validation, resolve or explain each action, and export a fresh JSON snapshot for review.

That process is the point of the case study: the dashboard is useful when every attractive chart can be traced back to a boundary, a source value, a conversion, and a formula.
