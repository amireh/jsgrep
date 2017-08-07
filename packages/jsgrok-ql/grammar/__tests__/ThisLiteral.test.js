const { createTokenTests, builders: b } = require('./utils')

createTokenTests('ThisLiteral', {
  ok: [
    [ 'this', b.thisLiteral() ]
  ]
})
