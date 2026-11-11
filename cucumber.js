module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['support/**/*.ts', 'features/**/*.ts'],
    requireModule: ['tsx/cjs'],
    format: ['progress-bar'],
    publishQuiet: true,

    format: [
      'progress',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/cucumber-report.xml'
    ]
  },
};
