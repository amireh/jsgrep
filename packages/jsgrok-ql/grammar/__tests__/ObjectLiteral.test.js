const { createTokenTests } = require('./utils')

createTokenTests('ObjectLiteral', {
  ok: [
    [ '{}',               'L_EMPTY_OBJECT' ],

    [ '{ a }',            { object: { keys: ['a'],      properties: { 'a': [['L_ANY']] } } } ],
    [ '{ a: "b" }',       { object: { keys: ['a'],      properties: { 'a': [['b']] } } } ],
    [ '{ a: 42 }',        { object: { keys: ['a'],      properties: { 'a': [[42]] } } } ],
    [ '{ a: /foo/ }',     { object: { keys: ['a'],      properties: { 'a': [[{ regexp: 'foo' }]] } } } ],
    [ '{ a: :object }',  { object: { keys: ['a'],      properties: { 'a': [['L_CLASS_OBJECT']] } } } ],
    [ '{ a: null }',      { object: { keys: ['a'],      properties: { 'a': [['L_NULL']] } } } ],
    [ '{ a, b }',         { object: { keys: ['a','b'],  properties: { 'a': [['L_ANY']], 'b': [['L_ANY']] } } } ],
    [ '{ a: "b", b: * }', { object: { keys: ['a','b'],  properties: { 'a': [['b']], 'b': [['L_ANY']] } } } ],

    // Flags
    [ '{ ?a }',            { object: { keys: ['a'], properties: { 'a': [['L_ANY'], 'F_OPT'] } } } ],
    [ '{ ^a }',            { object: { keys: ['a'], properties: { 'a': [['L_ANY'], 'F_NOT'] } } } ],
    [ '{ ?a, ^b }',        { object: { keys: ['a','b'], properties: { 'a': [['L_ANY'], 'F_OPT'], 'b': [['L_ANY'], 'F_NOT'] } } } ],
  ]
})
