let path = require('path')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let CleanWebpackPlugin = require('clean-webpack-plugin')

const BASE_CONFIG = require('./webpack.base')
const OUTPUT_PATH = path.resolve('dist-examples')

module.exports = Object.assign({}, BASE_CONFIG, {
  entry: './src/examples/main.js',
  output: {
    path: OUTPUT_PATH,
    filename: 'main.js',
  },
  plugins: [
    new CleanWebpackPlugin([OUTPUT_PATH]),
    new HtmlWebpackPlugin({
      title: 'Examples of Vue.js long list',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
})
