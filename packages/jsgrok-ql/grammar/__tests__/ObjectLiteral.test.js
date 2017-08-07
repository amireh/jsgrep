const { createTokenTests, builders: b } = require('./utils')

createTokenTests('ObjectLiteral', {
  ok: [
    [ '{}',               b.object({ keys: [],    properties: [] }) ],
    [ '{ a }',            b.object({ keys: ['a'], properties: { 'a': b.anyLiteral() } }) ],
    [ '{ a: "b" }',       b.object({ keys: ['a'], properties: { 'a': b.string(b.literal('b')) } }) ],
    [ '{ a: 42 }',        b.object({ keys: ['a'], properties: { 'a': b.number(b.literal(42)) } }) ],
    [ '{ a: /foo/ }',     b.object({ keys: ['a'], properties: { 'a': b.regexp({ pattern: b.literal('foo') }) } }) ],
    [ '{ a: :object }',   b.object({ keys: ['a'], properties: { 'a': b.object({ keys: null, properties: null }) } }) ],
    [ '{ a: null }',      b.object({ keys: ['a'], properties: { 'a': b.nullLiteral() } }) ],
    [ '{ a, b }',         b.object({ keys: ['a','b'],  properties: { 'a': b.anyLiteral(), 'b': b.anyLiteral() } }) ],
    [ '{ a: "b", b: * }', b.object({ keys: ['a','b'],  properties: { 'a': b.string(b.literal('b')), 'b': b.anyLiteral() } }) ],
    [ '{ ?a }',           b.object({ keys: ['a'], properties: { 'a': b.flags({ optional: true })(b.anyLiteral()) } }) ],
    [ '{ ^a }',           b.object({ keys: ['a'], properties: { 'a': b.flags({ negated: true })(b.anyLiteral()) } }) ],
    [ '{ a: ^:number }',  b.object({ keys: ['a'], properties: { 'a': b.flags({ negated: true })(b.number(b.anyLiteral())) } }) ],
    [ '{ a: ^42 }',       b.object({ keys: ['a'], properties: { 'a': b.flags({ negated: true })(b.number(b.literal(42))) } }) ],
    [ '{ ?a, ^b }',       b.object({
      keys: ['a','b'],
      properties: {
        'a': b.flags({ optional: true })(b.anyLiteral()),
        'b': b.flags({ negated: true })(b.anyLiteral()),
      }
    }) ],
  ]
})
