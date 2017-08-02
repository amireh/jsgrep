const { createTokenTests } = require('./utils')

createTokenTests('Receiver', {
  ok: [
    [ '*', 'L_ANY' ],
    [ 'this', 'L_THIS' ],
    [ 'foo', 'foo' ]
  ],
})
