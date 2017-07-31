const nearley = require('nearley/lib/nearley.js');
const compile = require('nearley/lib/compile.js');
const generate = require('nearley/lib/generate.js');
const grammar = require('nearley/lib/nearley-language-bootstrapped.js');
const tap = f => x => { f(x); return x }
const partial = f => x => f.bind(null, x);

module.exports = token => {
  const parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  const input = `
    TestEntry -> ${token}
    @include "./grammar/jsgrok-ql.ne"
  `
  parser.feed(input);

  const grammarStr = generate(compile(parser.results[0], {}));

  // when we eval this it will override "module.exports" so hang on to that
  const restoreExports = partial(function(x) { module.exports = x; })(module.exports);

  eval(grammarStr);

  return tap(restoreExports)(module.exports)
}