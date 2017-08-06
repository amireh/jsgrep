const parseQuery = require('./parseQuery');
const parseSourceCode = require('./parseSourceCode');
const walkSourceCode = require('./walkSourceCode');
const evaluateQuery = require('./evaluateQuery');

// THIS MUST BE IN SYNC WITH analyzer.cpp
const ERROR_TYPES = {
  SourceCodeError: 1,
  SearchError: 2,
  QueryError: 3,
};

const InvalidQuery = {};

const queryCache = {};
const memoize = f => x => {
  if (queryCache.hasOwnProperty(x)) {
    return queryCache[x];
  }

  const y = f(x);

  queryCache[x] = y;

  return y;
}

const loadOrParseQuery = memoize(parseQuery);

exports.apply = function(sourceQuery, sourceCode, filePath, options = {}) {
  const debug = options.debug === true;

  let query;

  try {
    query = loadOrParseQuery(sourceQuery)
  }
  catch (e) {
    queryCache[sourceQuery] = InvalidQuery;

    return [{
      error: true,
      error_type: ERROR_TYPES.QueryError,
      file: filePath,
      message: e.message
    }]
  }

  if (query === InvalidQuery || !query.length) {
    return [];
  }

  let ast;

  try {
    ast = parseSourceCode(sourceCode);
  }
  catch (e) {
    return [{
      error: true,
      error_type: ERROR_TYPES.SourceCodeError,
      file: filePath,
      message: e.message
    }];
  }

  try {
    return evaluateQuery(walkSourceCode, query, ast, sourceCode, { debug });
  }
  catch (e) {
    if (debug) {
      console.log(e.stack)
    }

    return [{
      error: true,
      error_type: ERROR_TYPES.SearchError,
      file: filePath,
      message: e.message
    }];
  }
}