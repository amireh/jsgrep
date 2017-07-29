const { assert } = require('chai');
const { inspect } = require('util')
const asPair = require('./asPair')

const throwUnknownVerifier = type => assert(false, `Don't know how to verify expressions of type "${type}"`);
const verify = type => TypeVerifiers[type] || throwUnknownVerifier(type);
const TypeVerifiers = {
  'function-call': (expected, actual) => {
    if (expected.id) {
      assert.equal(expected.id, actual.id);
    }

    if (expected.arguments) {
      verify('function-call-arguments')(
        expected.arguments.map(asPair),
        actual.arguments.map(asPair)
      );
    }
  },

  'function-call-arguments': (expected, actual) => {
     expected.forEach((arg, index) => {
      assert.equal(arg[0], actual[index][0])
    })
  }
}

module.exports = function assertDirectiveMatch(directives, query) {
  console.log('query?', inspect(query, { depth: 5 }))

  query.expressions.forEach((expr, index) => {
    const exprSpec = asPair(directives[index]);

    assert.equal(exprSpec[0], expr[0]);

    if (exprSpec[1]) {
      verify(expr[0])(exprSpec[1], expr[1]);
    }
  })
}
