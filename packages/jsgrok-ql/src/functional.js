exports.pipe = function(fns) {
  if (!Array.isArray(fns)) {
    fns = Array.prototype.slice.call(arguments);
  }

  return function() {
    const args = Array.prototype.slice.call(arguments);

    return fns.reduce(function(composite, fn) {
      if (composite === args) {
        return fn.apply(null, args);
      }
      else {
        return fn(composite);
      }
    }, args)
  }
}
exports.partial = (f, x) => f.bind(null, x)