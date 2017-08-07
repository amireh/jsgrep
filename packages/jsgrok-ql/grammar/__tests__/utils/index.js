exports.createGrammarForToken = require('./createGrammarForToken')
exports.parseWithGrammar = require('./parseWithGrammar')
exports.createTokenTests = require('./createTokenTests')
exports.builders = require('./builders')

exports.prop = (k, v) => {
  return { __$prop: true, k, v }
}

exports.match = ({ expr, props }) => {

}