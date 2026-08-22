# Carbon ESG Calculator

Carbon ESG Calculator is a browser-based workspace for BRSR Core calculations and GRI reporting preparation. It combines structured data entry, validation, dashboards, portable project files, and report exports in a responsive interface.

## What it supports

### BRSR Core

- GHG, water, energy, waste, safety, well-being, diversity, inclusive-development, fairness, and openness calculations
- Shared operational denominators and multi-year records
- Dashboard charts, ambitions, validation guidance, and a one-page landscape PDF export

### GRI reporting

- Reporting setup, material-topic assessment, disclosure tracking, omissions, and evidence references
- Metric input groups with calculated environmental, social, and procurement indicators
- Nine GRI 1 compliance gates and a weighted internal-readiness model
- GRI Content Index Markdown export and a one-page landscape dashboard PDF

The readiness result is an internal planning indicator, not a score issued or endorsed by the Global Reporting Initiative. Its base calculation combines completion and response quality; an optional evidence-relevance factor can be enabled as an additional internal control.

## Using the calculator

1. Create a workspace and select BRSR or GRI.
2. Enter the company profile and reporting-period data.
3. Complete the framework-specific inputs and resolve validation guidance.
4. Review calculated metrics, charts, ambitions, and reporting completeness.
5. Export the dashboard as PDF or save the complete workspace as JSON.

JSON is the portable source record and can be loaded back into either framework. The PDF is a dashboard snapshot. GRI users can separately export the Content Index as Markdown.

The repository includes import-ready [case studies](case-studies/README.md) for the BRSR and GRI workflows. The original company reports are intentionally not bundled.

## Data and analytics

Workspace values, evidence, financial records, and calculated results remain in the browser and are saved in local storage. Analytics records limited usage context such as the organization name, reporting year, active framework, and interaction type to understand adoption and industry trends; reporting values are excluded.

Export a JSON backup before clearing browser storage or moving to another device.

## Project structure

```text
index.html          Application shell and BRSR interface
js/                 Calculation, data, export, persistence, and GRI modules
case-studies/       Importable example workspaces and walkthroughs
tests/              Unit tests, Playwright tests, manifests, and tooling
.github/workflows/  Continuous-integration workflow
netlify.toml        Netlify build and publish configuration
```

## Reporting responsibility

Review source disclosures, calculation boundaries, units, emission factors, omissions, and cited evidence before publishing. The calculator supports preparation and internal review; it does not replace professional judgment, external assurance, SEBI requirements, or the official GRI Standards.
