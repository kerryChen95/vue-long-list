let precss = require('precss')
let cssNext = require('postcss-cssnext')

module.exports = {
  devtool: 'cheap-source-map',
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
      css: 'style!css',
    },
    postcss: [
      cssNext(),
    ],
    // cssnext中已经包含有了autoprefixer
    autoprefixer: false,
  },
  postcss () {
    return [
      precss(),
      cssNext(),
    ]
  },
}
