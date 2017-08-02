const parseQuery = require('./parseQuery');
const parseSourceCode = require('./parseSourceCode');
const walkSourceCode = require('./walkSourceCode');
const evalQuery = require('./eval');

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

exports.apply = function(sourceQuery, sourceCode, filePath) {
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
    return evalQuery(walkSourceCode, query, ast, sourceCode);
  }
  catch (e) {
    console.log(e.stack)
    return [{
      error: true,
      error_type: ERROR_TYPES.SearchError,
      file: filePath,
      message: e.message
    }];
  }
}