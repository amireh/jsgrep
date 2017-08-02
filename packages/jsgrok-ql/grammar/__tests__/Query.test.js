const { createTokenTests } = require('./utils')

createTokenTests('Query', {
  ok: [
    [ 'foo()', createTokenTests.Ignore, { focus: false } ],
    [ 'foo().bar()', createTokenTests.Ignore, { focus: false } ],
    [ 'foo().bar().baz()', createTokenTests.Ignore, { focus: false } ],
  ]
})
