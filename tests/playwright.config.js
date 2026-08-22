const { defineConfig } = require('@playwright/test');

const executablePath = process.env.PLAYWRIGHT_BROWSER_PATH;

module.exports = defineConfig({
    testDir: './e2e',
    timeout: 30000,
    use: {
        baseURL: 'http://127.0.0.1:4173',
        viewport: { width: 1280, height: 720 },
        trace: 'retain-on-failure',
        ignoreHTTPSErrors: true,
        launchOptions: executablePath ? { executablePath } : {}
    },
    webServer: {
        command: 'node server.js',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true
    }
});
