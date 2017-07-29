const acorn = require('../../acorn/index.js');

require('../../acorn-jsx/index.js')(acorn);
require('../../acorn-asyncawait/index.js')(acorn);
require('../../acorn-object-spread/index.js')(acorn);
require('../../acorn-static-class-property-initializer/index.js')(acorn);
require('../../acorn-dynamic-import/index.js')(acorn);

module.exports = function parseSourceCode(sourceCode) {
  return acorn.parse(sourceCode, {
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
  });
}
