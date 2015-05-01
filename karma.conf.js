module.exports = function(config) {
  config.set({
    frameworks: ['mocha',  'browserify', 'sinon', 'chai'],

    files: [
      '*.js',
      'bind.js',
      'test/spec/*.js',
      'test/index.js',
    ],

    client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'tdd',
      },
    },

  });
};