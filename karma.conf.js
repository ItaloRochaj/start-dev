module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false
      }
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/start-dev'),
      reports: ['html', 'lcovonly', 'text-summary', 'text'],
      fixWebpackSourcePaths: true,
      emitWarning: true,
      skipFilesWithNoCoverage: false,
      thresholds: {
        statements: 0,
        lines: 0,
        branches: 0,
        functions: 0
      }
    },
    reporters: ['progress', 'coverage-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    browserNoActivityTimeout: 180000,
    browserDisconnectTimeout: 30000,
    browserDisconnectTolerance: 5,
    captureTimeout: 180000,
    reportSlowerThan: 500,
    tmpDir: './karma-tmp',
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-web-security',
          '--disable-background-networking',
          '--disable-client-side-phishing-detection',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-sync',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--enable-automation',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--allow-running-insecure-content',
          '--disable-site-isolation-trials'
        ]
      }
    }
  });
};
