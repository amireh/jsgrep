const { assert } = require('chai');
const { inspect } = require('util')
const asPair = require('./asPair')

const throwUnknownVerifier = type => assert(false, `Don't know how to verify expressions of type "${type}"`);
const verify = type => TypeVerifiers[type] || throwUnknownVerifier(type);
const TypeVerifiers = {
  'function-call': (expected, actual) => {
    Object.keys(expected).forEach(key => {
      switch (key) {
        case 'id':
          assert.equal(expected.id, actual.id);
        break;

        case 'receiver':
          assert.equal(expected.receiver, actual.receiver);
        break;

        case 'arguments':
          verify('function-call::arguments')(
            expected.arguments.map(asPair),
            actual.arguments.map(asPair)
          );
        break;

        default:
          assert(false, `Don't know how to verify function-call property "${key}"`)
      }
    })
  },

  'function-call::arguments': (expected, actual) => {
     expected.map(asPair).forEach((arg, index) => {
      if (!actual[index]) {
        console.log(actual)
      }
      assert.equal(arg[0], actual[index][0])
    })
  }
}

module.exports = function assertDirectiveMatch(directives, query) {
  query.expressions.forEach((expr, index) => {
    const exprSpec = asPair(directives[index]);

    assert.equal(exprSpec[0], expr[0]);

    if (exprSpec[1]) {
      verify(expr[0])(exprSpec[1], expr[1]);
    }
  })
}
