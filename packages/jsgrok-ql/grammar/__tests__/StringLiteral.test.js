const { createTokenTests, builders: b } = require('./utils')

createTokenTests('StringLiteral', {
  ok: [
    [ '"Hello World!"', b.string(b.literal('Hello World!')) ]
  ]
})
