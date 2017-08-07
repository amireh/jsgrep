const { t } = require('../utils')
const { SYM_DEFAULT } = require('../constants')

exports.on = 'imported-identifier'
exports.extractPoint = expr => expr[1]
exports.expand = expr => ({
  ImportDeclaration(node) {
    if (t.literalOf(expr[1].source, node.source)) {
      let specifier;

      if (expr[1].symbol === SYM_DEFAULT) {
        specifier = node.specifiers.filter(t.importDefaultSpecifier)[0]
      }
      else {
        specifier = node.specifiers.filter(t.importSpecifierOf(expr[1].symbol))[0]
      }

      if (specifier) {
        return [ expr, [ 'identifier', specifier.local.name ] ]
      }
    }

    return null
  }
})