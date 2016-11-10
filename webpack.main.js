let path = require('path')
let CleanWebpackPlugin = require('clean-webpack-plugin')

const BASE_CONFIG = require('./webpack.base')
const PACKAGE = require('./package.json')
const OUTPUT_PATH = path.join(__dirname, path.dirname(PACKAGE.main))

module.exports = Object.assign({}, BASE_CONFIG, {
  entry: './src/index.js',
  output: {
    path: OUTPUT_PATH,
    filename: path.basename(PACKAGE.main),
    library: 'VueLongList',
    libraryTarget: 'umd',
  },
  plugins: [
    new CleanWebpackPlugin([OUTPUT_PATH]),
  ],
})
