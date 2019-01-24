/* global __dirname, require, module*/

const webpack = require( 'webpack' );
const path = require( 'path' );
const env = require( 'yargs' ).argv.env; // use --env with webpack 2
const pkg = require( './package.json' );

const libraryName = pkg.name;

let outputFile, mode;

if ( env === 'build' ) {
  mode = 'production';
  outputFile = libraryName + '.min.js';
} else {
  mode = 'development';
  outputFile = libraryName + '.js';
}

const config = {
  mode,
  entry: __dirname + '/src/index.js',
  devtool: 'inline-source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /(\.xml|\.wikitext)$/,
        loader: 'raw-loader',
        include: /ruwiki/,
      },
    ],
  },
  resolve: {
    modules: [ path.resolve( './node_modules' ), path.resolve( './src' ) ],
    extensions: [ '.json', '.js' ],
  },
};

module.exports = config;
