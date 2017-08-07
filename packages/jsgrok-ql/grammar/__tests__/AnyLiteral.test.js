const { createTokenTests, builders: b } = require('./utils')

createTokenTests('AnyLiteral', {
  ok: [
    [ '*', b.anyLiteral() ]
  ]
})
