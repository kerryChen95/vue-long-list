let path = require('path')
let webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: './src/examples/main.js',
  output: {
    path: path.resolve('./dist/examples'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['', '.js', '.vue'],
  },
  module: {
    loaders: [
      {test: /\.vue$/, loader: 'vue'},
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
    ],
  },
  vue: {
    loaders: {
      js: 'babel',
    },
  },
  plugins: [
    new CleanWebpackPlugin(['dist/examples']),
    new HtmlWebpackPlugin({
      title: 'Examples of Vue.js long list',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
}
