const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.goto('/');
    await expect(page.locator('#project-tabs-list')).toContainText('Sample Workspace');
});

test('runtime dependencies and Tailwind styles load', async ({ page }) => {
    await expect.poll(() => page.evaluate(() => typeof Chart)).toBe('function');
    await expect.poll(() => page.evaluate(() => typeof html2pdf)).toBe('function');
    await expect(page.locator('#landing-hero img')).toHaveCSS('width', '320px');
});

test('desktop navbar preserves branding and workspace controls', async ({ page }) => {
    await expect(page.getByText('Carbon ESG', { exact: true })).toBeVisible();
    const newWorkspace = page.getByText('New Workspace', { exact: true });
    await expect(newWorkspace).toBeVisible();
    await expect(page.getByText('New', { exact: true })).toBeHidden();
    const tabs = page.locator('#project-tabs-list > *');
    const initialCount = await tabs.count();
    await newWorkspace.click();
    await expect(tabs).toHaveCount(initialCount + 1);
    await expect(tabs.last()).toContainText('Untitled Project');
});

test('a GRI ambition appears on the GRI overview', async ({ page }) => {
    await page.locator('#framework-gri').click();
    await page.locator('#nav-ambitions').click();
    await page.locator('#amb-metric').selectOption('griGrossEmissions');
    await page.locator('#amb-year').fill('2030');
    await page.locator('#amb-target').fill('60000');
    await page.getByRole('button', { name: 'Add Ambition' }).click();
    await page.locator('#nav-gri-overview').click();
    await expect(page.locator('#gri-overview-root')).toContainText('GRI ambitions');
    await expect(page.locator('#gri-overview-root')).toContainText('60,000 by 2030');
});

test('GRI rendering does not mutate initialized reporting state', async ({ page }) => {
    await page.locator('#framework-gri').click();
    const unchanged = await page.evaluate(() => {
        const project = appData.projects[appData.activeHash];
        const before = JSON.stringify(project.years[project.currentFY].gri);
        renderGRI();
        renderGRI();
        return before === JSON.stringify(project.years[project.currentFY].gri);
    });
    expect(unchanged).toBe(true);
});

test('a disclosure remains expanded after a status update', async ({ page }) => {
    await page.locator('#framework-gri').click();
    await page.locator('#nav-gri-disclosures').click();
    const first = page.locator('#gri-disclosures-root details').first();
    await first.evaluate(element => { element.open = true; });
    await first.locator('select').nth(1).selectOption('partial');
    await expect(page.locator('#gri-disclosures-root details').first()).toHaveAttribute('open', '');
});

test('BRSR aggregate wiring updates outputs and persists GHG provenance', async ({ page }) => {
    await page.evaluate(() => {
        document.getElementById('g_revenue').value = '1000';
        document.getElementById('nrg_ren').value = '20';
        document.getElementById('nrg_non').value = '80';
        calculateAll({ renderVisuals: false });
        saveDOMToFY();
    });
    await expect(page.locator('#res_nrg_total')).toHaveText('100.00');
    await expect(page.locator('#res_nrg_perc')).toHaveText('20.00');
    const row = await page.evaluate(() => appData.projects[appData.activeHash].years[appData.projects[appData.activeHash].currentFY].ghgRows[0]);
    expect(row.scale).toBe('1');
    expect(row.unit).toBe('MWh');
});

test('GRI navigation does not emit BRSR calculation events', async ({ page }) => {
    await page.evaluate(() => { dataLayer.length = 0; switchFramework('gri'); });
    await page.locator('#nav-gri-metrics').click();
    await page.waitForTimeout(200);
    const actions = await page.evaluate(() => dataLayer.map(entry => entry[1]));
    expect(actions).not.toContain('calculate_metrics');
});

test('BRSR calculation analytics are debounced and exclude reporting values', async ({ page }) => {
    await page.locator('#nav-globals').click();
    await page.evaluate(() => { dataLayer.length = 0; });
    const revenue = page.locator('#g_revenue');
    await revenue.fill('1');
    await revenue.fill('12');
    await revenue.fill('123');
    await page.waitForTimeout(950);
    const events = await page.evaluate(() => dataLayer.filter(entry => entry[1] === 'calculate_metrics').map(entry => entry[2]));
    expect(events).toHaveLength(1);
    expect(events[0].framework).toBe('brsr');
    expect(events[0].type).toBe('user_input');
    expect(JSON.stringify(events[0])).not.toContain('123');
    await page.waitForTimeout(300);
    await expect.poll(() => page.evaluate(() => dataLayer.filter(entry => entry[1] === 'calculate_metrics').length)).toBe(1);
});

test('rejected imports leave the workspace unchanged', async ({ page }) => {
    const input = page.locator('input[type="file"]');
    const snapshot = () => page.evaluate(() => {
        const project = appData.projects[appData.activeHash];
        return {
            activeHash: appData.activeHash,
            projectHashes: Object.keys(appData.projects).sort(),
            name: project.name,
            currentFY: project.currentFY,
            revenue: project.years[project.currentFY].inputs.g_revenue
        };
    });
    const runWithDialog = async trigger => {
        let message = '';
        await Promise.all([
            page.waitForEvent('dialog').then(async dialog => {
                message = dialog.message();
                await dialog.accept();
            }),
            trigger()
        ]);
        return message;
    };
    const before = await snapshot();

    let message = await runWithDialog(() => input.setInputFiles({ name: 'malformed.json', mimeType: 'application/json', buffer: Buffer.from('{not json') }));
    expect(message).toContain('Import stopped');
    expect(await snapshot()).toEqual(before);

    message = await runWithDialog(() => input.setInputFiles({ name: 'oversized.json', mimeType: 'application/json', buffer: Buffer.alloc((5 * 1024 * 1024) + 1, 32) }));
    expect(message).toContain('smaller than 5 MB');
    expect(await snapshot()).toEqual(before);

    message = await runWithDialog(() => page.evaluate(() => {
        window.FileReader = class {
            readAsText() {
                queueMicrotask(() => this.onerror());
            }
        };
        importProjectJSON(new File(['{}'], 'unreadable.json', { type: 'application/json' }));
    }));
    expect(message).toContain('could not be read');
    expect(await snapshot()).toEqual(before);
});

test('failed PDF export restores BRSR presentation state', async ({ page }) => {
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    page.once('dialog', dialog => dialog.accept());
    await page.evaluate(async () => {
        window.html2pdf = () => ({ set() { return this; }, from() { return this; }, save() { return Promise.reject(new Error('failed')); } });
        await downloadPDF();
    });
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('#dashboard-export-area')).not.toHaveAttribute('style', /width:/);
});

test('failed PDF export restores GRI presentation state', async ({ page }) => {
    await page.evaluate(() => {
        switchFramework('gri');
        openTab('tab-gri-overview');
        document.documentElement.classList.add('dark');
    });
    page.once('dialog', dialog => dialog.accept());
    await page.evaluate(async () => {
        window.html2pdf = () => ({ set() { return this; }, from() { return this; }, save() { return Promise.reject(new Error('failed')); } });
        await downloadGRIDashboardPDF();
    });
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('#gri-dashboard-export-area')).not.toHaveAttribute('style', /width:/);
});

test('successful PDF exports restore BRSR and GRI presentation state', async ({ page }) => {
    const brsr = await page.evaluate(async () => {
        const animation = Chart.defaults.animation;
        window.__pdfCaptures = {};
        window.html2pdf = () => ({
            set(options) { this.options = options; return this; },
            from(element) {
                const expandable = [...element.querySelectorAll('[data-pdf-expand]')];
                window.__pdfCaptures[element.id] = {
                    text: element.innerText,
                    width: element.scrollWidth,
                    format: this.options.jsPDF.format,
                    orientation: this.options.jsPDF.orientation,
                    expanded: expandable.every(node => node.scrollHeight <= node.clientHeight)
                };
                return this;
            },
            save() { return Promise.resolve(); }
        });
        document.documentElement.classList.add('dark');
        await downloadPDF();
        return { dark: document.documentElement.classList.contains('dark'), animationRestored: Chart.defaults.animation === animation, capture: window.__pdfCaptures['dashboard-export-area'] };
    });
    expect(brsr.dark).toBe(true);
    expect(brsr.animationRestored).toBe(true);
    expect(brsr.capture.text).toContain('BRSR Core Dashboard');
    expect(brsr.capture.text).toContain('Company Profile');
    expect(brsr.capture.text).toContain('Active Targets Performance');
    expect(brsr.capture.width).toBe(1600);
    expect(brsr.capture.format).toBe('a3');
    expect(brsr.capture.orientation).toBe('landscape');
    await expect(page.locator('#dashboard-export-area')).not.toHaveAttribute('style', /width:/);

    const gri = await page.evaluate(async () => {
        switchFramework('gri');
        openTab('tab-gri-overview');
        const animation = Chart.defaults.animation;
        await downloadGRIDashboardPDF();
        return { dark: document.documentElement.classList.contains('dark'), animationRestored: Chart.defaults.animation === animation, capture: window.__pdfCaptures['gri-dashboard-export-area'] };
    });
    expect(gri.dark).toBe(true);
    expect(gri.animationRestored).toBe(true);
    expect(gri.capture.text).toContain('GRI Reporting Dashboard');
    expect(gri.capture.text).toContain('Nine GRI 1 compliance gates');
    expect(gri.capture.text).toContain('Readiness by standard');
    expect(gri.capture.width).toBe(2800);
    expect(gri.capture.format).toBe('a2');
    expect(gri.capture.orientation).toBe('landscape');
    expect(gri.capture.expanded).toBe(true);
    await expect(page.locator('#gri-dashboard-export-area')).not.toHaveAttribute('style', /width:/);
});

test('GRI controls retain usable dimensions on mobile', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.goto('/');
    await page.evaluate(() => { switchFramework('gri'); openTab('tab-gri-setup'); });
    await expect(page.locator('#gri-setup-root')).toContainText('GRI Reporting Setup');
    const dimensions = await page.evaluate(() => {
        const date = document.querySelector('#gri-setup-root input[type="date"]').getBoundingClientRect();
        const select = document.querySelector('#gri-setup-root select').getBoundingClientRect();
        return { dateHeight: date.height, selectHeight: select.height, dateWidth: date.width, selectWidth: select.width, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    expect(dimensions.dateHeight).toBeGreaterThanOrEqual(44);
    expect(dimensions.selectHeight).toBeGreaterThanOrEqual(44);
    expect(dimensions.dateWidth).toBeGreaterThan(250);
    expect(dimensions.selectWidth).toBeGreaterThan(250);
    expect(dimensions.overflow).toBeLessThanOrEqual(1);
    await context.close();
});

test('mobile navbar retains its compact workspace control', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.goto('/');
    await expect(page.getByText('Carbon ESG', { exact: true })).toBeHidden();
    await expect(page.getByText('New Workspace', { exact: true })).toBeHidden();
    await expect(page.getByText('New', { exact: true })).toBeVisible();
    await context.close();
});
