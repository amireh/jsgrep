module.exports = [
  [ 'foo()', {
    directives: [
      [ 'function-call', {
        id: 'foo',
        arguments: []
      }]
    ]
  }],

  [ 'foo(void)', {
    directives: [
      [ 'function-call', {
        id: 'foo',
        arguments: [ 'L_VOID' ]
      }]
    ]
  }],

  [ 'fooBar()', {
    directives: [
      [ 'function-call', { id: 'fooBar' }]
    ]
  }],

  // forbids reserved keywords as identifiers
  [ 'this()', { error: 'col 5' }],
  [ 'void()', { error: 'col 5' }],
  [ '*()',    { error: 'col 2' }],

  // member function calls to any receiver
  [ '.fooBar()', {
    error: 'invalid syntax at line 1 col 1'
  }],

  // member function calls to `this` as a receiver
  [ 'this.fooBar()', {
    directives: [
      [ 'function-call', {
        receiver: 'L_THIS'
      }]
    ]
  }],

  // member function calls to `XOXO` as a receiver
  [ 'XOXO.fooBar()', {
    directives: [
      [ 'function-call', {
        receiver: 'XOXO'
      }]
    ]
  } ],
];
