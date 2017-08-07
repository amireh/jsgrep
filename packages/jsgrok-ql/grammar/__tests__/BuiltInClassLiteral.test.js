const { createTokenTests, builders: b } = require('./utils')

createTokenTests('BuiltInClassLiteral', {
  ok: [
    [ ':string', b.string(b.anyLiteral()) ],
    [ ':number', b.number(b.anyLiteral()) ],
    [ ':regexp', b.regexp({ pattern: b.anyLiteral() }) ],
    [ ':object', b.object({ keys: null, properties: null }) ],
  ]
})
