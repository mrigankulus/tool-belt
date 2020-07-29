var ourProtractor = require('our-protractor');
var config = ourProtractor.getDefaultConfig({
    context: 'my-app',
    //optional arguments for non-standard subdomains and/or non-angular applications
    rootUrl: {
      local: 'http://localhost:8000',
      dev: 'https://dev-tool-belt.apps-dev.wwt.com',
      test: 'https://dev-tool-belt.apps-tst.wwt.com'
    },
    // login: {
    //   testerName: 'ecm-kennedyb',
    //   testerPassword: 'pass123'
    // },
    showColors: false, //default is true
    isVerbose: true, //default is false
    includeStackTrace: true, //default is false
    defaultTimeoutInterval: 50000 //default is 30000
});

config.specs = [
    'qa/**/*Spec.js'
];

exports.config = config;
