const { createTokenTests, builders: b } = require('./utils')

createTokenTests('Receiver', {
  ok: [
    [ '*', b.anyLiteral() ],
    [ 'this', b.thisLiteral() ],
    [ 'foo', b.identifier('foo') ]
  ],
})
