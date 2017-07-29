module.exports = function(walk) {
  // we must provide this otherwise walk.simple will complain:
  //
  //     base[type] is not a function
  walk.base.Import = function() {};
}