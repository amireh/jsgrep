const { assert } = require('chai');
const subject = require('../parseQuery');
const { assertExpressionMatch, createSpecimenTests } = require('./utils')

describe('jsgrok-ql', function() {
  createSpecimenTests('query')(specs => {
    specs.forEach(function([ input, output ]) {
      it(input, function() {
        if (output && typeof output.error === 'string') {
          assert.throws(() => subject(input), output.error)
        }
        else if (output === null) {
          assert.equal(subject(input), null);
        }
        else if (output === undefined) {
          assert.ok(subject(input));
        }
        else {
          const result = subject(input);

          if (output.directives) {
            assertExpressionMatch(output.directives, result)
          }
          else {
            assert(false, "Don't know how to handle custom assertions yet")
          }
        }
      })
    })
  });
});