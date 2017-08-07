const { t } = require('../utils')
const { SYM_DEFAULT } = require('../constants')

exports.on = 'ImportedIdentifier'
exports.expand = expr => ({
  ImportDeclaration(node) {
    if (t.literalOf(expr.source, node.source)) {
      let specifier;

      if (expr.symbol === SYM_DEFAULT) {
        specifier = node.specifiers.filter(t.importDefaultSpecifier)[0]
      }
      else {
        specifier = node.specifiers.filter(t.importSpecifierOf(expr.symbol))[0]
      }

      if (specifier) {
        return [ expr, { type: 'Identifier', name: specifier.local.name } ]
      }
    }

    return null
  }
})