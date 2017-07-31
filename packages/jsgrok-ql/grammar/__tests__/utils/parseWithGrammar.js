const nearley = require('nearley');
const util = require('util')

module.exports = grammar => input => {
  const parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  const state = parser.feed(input);
  const { results } = state;

  if (results && results.length === 1 && results[0].length === 1) {
    // console.log('results?', results, util.inspect(state, { depth: 5 }))
    return results[0][0]
  }
  else {
    // console.log('results?', results, util.inspect(state, { depth: 5 }))
    return results;
  }
}