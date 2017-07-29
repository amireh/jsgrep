const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    filename: 'jsgrok-ql.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    // target: 'commonjs',
  },
}