
// TODO fix order of files
function mixin(destination, source) {
  for (var k in source) {
    if (source.hasOwnProperty(k)) {
      destination.prototype[k] = source[k];
    }
  }
  return destination;
}
