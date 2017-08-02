const { createTokenTests } = require('./utils')

createTokenTests('RegExpLiteral', {
  ok: [
    [ '/foo/', { regexp: 'foo' } ],
  ]
})
