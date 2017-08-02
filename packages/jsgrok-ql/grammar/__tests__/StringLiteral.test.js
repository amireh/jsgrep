const { createTokenTests } = require('./utils')

createTokenTests('StringLiteral', {
  ok: [
    [ '"Hello World!"', 'Hello World!' ]
  ]
})
