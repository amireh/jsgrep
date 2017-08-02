const nearley = require('nearley');
const grammar = require('./grammar');
const NEARLEY_PARSE_ERROR = 'nearley: No possible parsings';

module.exports = input => {
  const parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

  try {
    parser.feed(input);
  }
  catch (e) {
    if (e.message.indexOf(NEARLEY_PARSE_ERROR) === 0) {
      return null;
    }
    else {
      throw e;
    }
  }

  return parser.results;
};