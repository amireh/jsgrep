const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: false,
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    filename: 'jsgrok-ql.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
  ]
}