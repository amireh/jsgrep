const { createTokenTests, builders: b } = require('./utils')

createTokenTests('RegExpLiteral', {
  ok: [
    [ '/foo/', b.regexp({ pattern: b.literal('foo') }) ],
  ]
})
