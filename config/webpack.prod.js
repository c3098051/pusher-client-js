const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')
const path = require('path')

process.env.NODE_ENV = 'production'
process.env.ENV = 'production'
const ENV = 'production'

module.exports = webpackMerge(commonConfig, {
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'js/pusher.min.js',
  },

  plugins: [
    // this should be located as first plugin..
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV),
        NODE_ENV: JSON.stringify(ENV),
      },
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      htmlLoader: {
        minimize: false, // workaround for ng2
      },
    }),
  ],
})
