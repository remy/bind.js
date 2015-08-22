module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '.',

    frameworks: ['mocha', 'browserify'],

    // list of files / patterns to load in the browser
    files: [
      'lib/**/*.js',
      'test/*.html',
      'test/**/*.test.js',
      'test/**/*.browser.js',
    ],

    preprocessors: {
      'test/*.html': ['html2js'],
      'lib/**/*.js': 'coverage',
      'lib/**/*.js': ['browserify'],
      'test/**/*.test.js': ['browserify'],
      'test/**/*.browser.js': ['browserify'],
    },

    browserify: {
      debug: true,
      transform: ['browserify-istanbul'],
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      type: process.env.TRAVIS ? 'lcovonly' : 'html',
      dir: 'coverage',

      reporters: [
        { type: 'html' },
        { type: 'lcovonly', subdir: '.' },
      ]
    },
    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [process.env.TRAVIS ? 'Firefox' : 'ChromeCanary'],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: true,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-html2js-preprocessor',
      'karma-browserify',
    ],
  });
};
