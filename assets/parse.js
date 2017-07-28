const acorn = require('acorn/index.js');
const walk = require('acorn/walk.js');
const analyze = require('analyze.js');

require('acorn-jsx/index.js')(acorn);
require('acorn-jsx/walk.js')(walk);
require('acorn-asyncawait/index.js')(acorn);
require('acorn-object-spread/index.js')(acorn);
require('acorn-object-spread/walk.js')(walk);
require('acorn-static-class-property-initializer/index.js')(acorn);
require('acorn-static-class-property-initializer/walk.js')(walk);
require('acorn-dynamic-import/index.js')(acorn);
require('acorn-dynamic-import/walk.js')(walk);

module.exports = function parse(sourceCode, filePath) {
  let ast;

  try {
    ast = acorn.parse(sourceCode, {
      sourceType: 'module',
      locations: true,
      ranges: false,
      ecmaVersion: 9,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowHashBang: true,
      plugins: {
        jsx: true,
        staticClassPropertyInitializer: true,
        objectSpread: true,
        dynamicImport: true,
        asyncawait: {
          awaitAnywhere: true,
          asyncExits: true,
        }
      }
    })
  }
  catch (e) {
    return [{
      error: true,
      file: filePath,
      message: e.message
    }];
  }

  return analyze(walk, ast);
}
