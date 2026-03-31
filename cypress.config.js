const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "gc4e5z",

  e2e: {
    // 1. Tell YouTube we are a real Mac user, not a bot
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    
    // 2. Disable security to allow us to click YouTube's internal player buttons
    chromeWebSecurity: false,

    setupNodeEvents(on, config) {
      // 3. Force the browser to a standard desktop size for the video recording
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--window-size=1920,1080');
          launchOptions.args.push('--force-device-scale-factor=1');
        }
        return launchOptions;
      });
      return config;
    },
    
    // This allows your tests to just use /watch?v=... instead of the full URL
    baseUrl: 'https://www.youtube.com',
    
    // Giving YouTube a little extra time to load that heavy player
    defaultCommandTimeout: 10000,
  },
});