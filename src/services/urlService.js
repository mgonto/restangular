function UrlService(config) {
  this.config = config;
}

var absolutePattern = /^https?:\/\//i;
UrlService.prototype.isAbsoluteUrl = function (string) {
  return _.isUndefined(this.config.absoluteUrl) || _.isNull(this.config.absoluteUrl) ?
    string && absolutePattern.test(string) :
    this.config.absoluteUrl;
};

UrlService.protoype.isOverridenMethod = function (method, values) {
  var search = values || this.config.methodOverriders;
  return !_.isUndefined(_.find(search, function (one) {
    return one.toLowerCase() === method.toLowerCase();
  }));
};

var safeMethods = ['get', 'head', 'options', 'trace', 'getlist'];
UrlService.protoype.isSafe = function (operation) {
  return _.contains(safeMethods, operation.toLowerCase());
};




