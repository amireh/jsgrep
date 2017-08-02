const { createTokenTests } = require('./utils')

createTokenTests('ThisLiteral', {
  ok: [
    [ 'this', 'L_THIS' ]
  ]
})
