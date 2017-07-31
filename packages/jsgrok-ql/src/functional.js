exports.pipe = function(fns) {
  if (!Array.isArray(fns)) {
    fns = Array.prototype.slice.call(arguments);
  }

  return x => fns.reduce(function(composite, fn) {
    return fn(composite);
  }, x)
}