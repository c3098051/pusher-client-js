const { SourceMapDevToolPlugin, NamedModulesPlugin } = require('webpack')
const webpackMerge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commonConfig = require('./webpack.common.js')
const path = require('path')

const entryPoints = ['main']
module.exports = webpackMerge(commonConfig, {
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[id].chunk.js',
  },

  plugins: [
    new SourceMapDevToolPlugin({
      filename: '[file].map[query]',
      moduleFilenameTemplate: '[resource-path]',
      fallbackModuleFilenameTemplate: '[resource-path]?[hash]',
      sourceRoot: 'webpack:///',
    }),

    new HtmlWebpackPlugin({
      template: './example/index.html',
      filename: './index.html',
      hash: false,
      inject: true,
      compile: true,
      favicon: false,
      minify: false,
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: [],
      title: 'Webpack App',
      xhtml: true,
      chunksSortMode: function sort(left, right) {
        const leftIndex = entryPoints.indexOf(left.names[0])
        const rightindex = entryPoints.indexOf(right.names[0])
        if (leftIndex > rightindex) {
          return 1
        } else if (leftIndex < rightindex) {
          return -1
        }
        return 0
      },
    }),
    // show relative path of the module when "hot module reloading" is enabled
    new NamedModulesPlugin({}),
  ],

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/(\\|\/)node_modules(\\|\/)/],
      },
    ],
  },
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
  },
})
