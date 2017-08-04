const walk = require('../../acorn/walk.js');

require('../../acorn-jsx/walk.js')(walk);
require('../../acorn-object-spread/walk.js')(walk);
require('../../acorn-static-class-property-initializer/walk.js')(walk);
require('../../acorn-dynamic-import/walk.js')(walk);

module.exports = walk.ancestor;