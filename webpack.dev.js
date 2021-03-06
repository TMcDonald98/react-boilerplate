const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const env = require('./env.js');

let config = merge(common, {
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    contentBase: './dist/public',
    historyApiFallback: true,
    port: env.ports.clientDev || 9080
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});

module.exports = config;
