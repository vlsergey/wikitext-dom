const path = require('path');
const webpack = require('webpack')

module.exports = function (config) {
  config.set({
    browsers: [ 'jsdom' ],
    browserNoActivityTimeout: 60000,
    frameworks: [ 'mocha' ],

    plugins: [
      'karma-chrome-launcher',
      'karma-jsdom-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],

    files: [
      'test/globals.js',
      'test/**/*Test.js',
    ],

    preprocessors: {
      'src/**/*.js': ['webpack', 'sourcemap'],
      'test/**/*.js': ['webpack', 'sourcemap'],
    },

    reporters: [
      'mocha',
    ],

    mochaReporter: {
      output: 'autowatch'
    },

    webpack: {
      mode: "development",
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
          },
          {
            // enforce: "pre",
            test: /\.js$/,
            include: /test/,
            exclude: /node_modules/,
            loader: "eslint-loader",
            options: {
              fix: true,
            }
          },
         ]
      },
      resolve: {
        modules: [
          path.resolve(__dirname, "src"),
          "node_modules"
        ],
      },
    },
  });
};
