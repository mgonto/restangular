// Promises
var PromiseExtension = function(promise, isCollection, valueToFill) {

  // Helpers
  function promiseCall(method) {
    var deferred = $q.defer();
    var callArgs = arguments;
    var filledValue = {};
    this.then(function(val) {
      var params = Array.prototype.slice.call(callArgs, 1);
      var func = val[method];
      func.apply(val, params);
      filledValue = val;
      deferred.resolve(val);
    });
    return restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection], filledValue);
  }

  function promiseGet(what) {
    var deferred = $q.defer();
    var filledValue = {};
    this.then(function(val) {
      filledValue = val[what];
      deferred.resolve(filledValue);
    });
    return restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection], filledValue);
  }


  promise.call = _.bind(promiseCall, promise);
  promise.get = _.bind(promiseGet, promise);
  promise[config.restangularFields.restangularCollection] = isCollection;
  if (isCollection) {
      promise.push = _.bind(promiseCall, promise, 'push');
  }
  promise.$object = valueToFill;
  if (config.restangularizePromiseInterceptor) {
    config.restangularizePromiseInterceptor(promise);
  }
  return promise;

}

