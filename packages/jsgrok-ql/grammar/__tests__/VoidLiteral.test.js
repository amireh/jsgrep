const { createTokenTests, builders: b } = require('./utils')

createTokenTests('VoidLiteral', {
  ok: [
    [ 'void', b.voidLiteral() ]
  ]
})
