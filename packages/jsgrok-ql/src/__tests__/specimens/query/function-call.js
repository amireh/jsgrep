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
        arguments: [ 'void-literal' ]
      }]
    ]
  }],
];
