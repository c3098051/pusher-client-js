const { NoEmitOnErrorsPlugin } = require('webpack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  resolve: {
    extensions: ['.js'],
    modules: ['./node_modules'],
    symlinks: true,
  },
  resolveLoader: {
    modules: ['./node_modules'],
  },
  entry: {
    main: ['./example/main.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new NoEmitOnErrorsPlugin(),
    new ProgressPlugin(),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/,
      failOnError: true,
    }),
  ],
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty',
    tls: 'empty',
    net: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false,
  },
}
