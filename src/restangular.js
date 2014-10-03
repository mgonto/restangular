var module = angular.module('restangular', []);

module.provider('Restangular', function() {
  // Configuration
  var globalConfiguration = {};

  Configurer.init(this, globalConfiguration);



  this.$get = ['$http', '$q', function($http, $q) {

    function createServiceForConfiguration(config) {
      var service = {};

      function resolvePromise(deferred, response, data, filledValue) {
        _.extend(filledValue, data);

        // Trigger the full response interceptor.
        if (config.fullResponse) {
          return deferred.resolve(_.extend(response, {
            data: data
          }));
        } else {
          deferred.resolve(data);
        }
      }



      function parseResponse(resData, operation, route, fetchUrl, response, deferred) {
        var data = config.responseExtractor(resData, operation, route, fetchUrl, response, deferred);
        var etag = response.headers('ETag');
        if (data && etag) {
          data[config.restangularFields.etag] = etag;
        }
        return data;
      }


      function fetchFunction(what, reqParams, headers) {
        var __this = this;
        var deferred = $q.defer();
        var operation = 'getList';
        var url = urlHandler.fetchUrl(this, what);
        var whatFetched = what || __this[config.restangularFields.route];

        var request = config.fullRequestInterceptor(null, operation,
            whatFetched, url, headers || {}, reqParams || {}, this[config.restangularFields.httpConfig] || {});

        var filledArray = [];
        filledArray = config.transformElem(filledArray, true, whatFetched, service);

        var method = 'getList';

        if (config.jsonp) {
          method = 'jsonp';
        }

        var okCallback = function(response) {
          var resData = response.data;
          var fullParams = response.config.params;
          var data = parseResponse(resData, operation, whatFetched, url, response, deferred);

          // support empty response for getList() calls (some APIs respond with 204 and empty body)
          if (_.isUndefined(data) || '' === data) {
            data = [];
          }
          if (!_.isArray(data)) {
            throw new Error('Response for getList SHOULD be an array and not an object or something else');
          }
          var processedData = _.map(data, function(elem) {
            if (!__this[config.restangularFields.restangularCollection]) {
              return restangularizeElem(__this, elem, what, true, data);
            } else {
              return restangularizeElem(__this[config.restangularFields.parentResource],
                elem, __this[config.restangularFields.route], true, data);
            }
          });

          processedData = _.extend(data, processedData);

          if (!__this[config.restangularFields.restangularCollection]) {
            resolvePromise(
              deferred,
              response,
              restangularizeCollection(
                __this,
                processedData,
                what,
                true,
                fullParams
              ),
              filledArray
            );
          } else {
            resolvePromise(
              deferred,
              response,
              restangularizeCollection(
                __this[config.restangularFields.parentResource],
                processedData,
                __this[config.restangularFields.route],
                true,
                fullParams
              ),
              filledArray
            );
          }
        };

        urlHandler.resource(this, $http, request.httpConfig, request.headers, request.params, what,
                this[config.restangularFields.etag], operation)[method]().then(okCallback, function error(response) {
          if (response.status === 304 && __this[config.restangularFields.restangularCollection]) {
            resolvePromise(deferred, response, __this, filledArray);
          } else if ( _.every(config.errorInterceptors, function(cb) { return cb(response, deferred, okCallback) !== false; }) ) {
            // triggered if no callback returns false
            deferred.reject(response);
          }
        });

        return PromiseExtension(deferred.promise, true, filledArray);
      }

      function withHttpConfig(httpConfig) {
        this[config.restangularFields.httpConfig] = httpConfig;
        return this;
      }


      function elemFunction(operation, what, params, obj, headers) {
        var __this = this;
        var deferred = $q.defer();
        var resParams = params || {};
        var route = what || this[config.restangularFields.route];
        var fetchUrl = urlHandler.fetchUrl(this, what);

        var callObj = obj || this;
        // fallback to etag on restangular object (since for custom methods we probably don't explicitly specify the etag field)
        var etag = callObj[config.restangularFields.etag] || (operation !== 'post' ? this[config.restangularFields.etag] : null);

        if (_.isObject(callObj) && config.isRestangularized(callObj)) {
          callObj = stripRestangular(callObj);
        }
        var request = config.fullRequestInterceptor(callObj, operation, route, fetchUrl,
          headers || {}, resParams || {}, this[config.restangularFields.httpConfig] || {});

        var filledObject = {};
        filledObject = config.transformElem(filledObject, false, route, service);

        var okCallback = function(response) {
          var resData = response.data;
          var fullParams = response.config.params;
          var elem = parseResponse(resData, operation, route, fetchUrl, response, deferred);
          if (elem) {

            if (operation === 'post' && !__this[config.restangularFields.restangularCollection]) {
              resolvePromise(deferred, response, restangularizeElem(__this, elem, what, true, null, fullParams), filledObject);
            } else {
              var data = restangularizeElem(
                __this[config.restangularFields.parentResource],
                elem,
                __this[config.restangularFields.route],
                true,
                null,
                fullParams
              );

              data[config.restangularFields.singleOne] = __this[config.restangularFields.singleOne];
              resolvePromise(deferred, response, data, filledObject);
            }

          } else {
            resolvePromise(deferred, response, undefined, filledObject);
          }
        };

        var errorCallback = function(response) {
          if (response.status === 304 && config.isSafe(operation)) {
            resolvePromise(deferred, response, __this, filledObject);
          } else if ( _.every(config.errorInterceptors, function(cb) { return cb(response, deferred, okCallback) !== false; }) ) {
            // triggered if no callback returns false
            deferred.reject(response);
          }
        };
        // Overring HTTP Method
        var callOperation = operation;
        var callHeaders = _.extend({}, request.headers);
        var isOverrideOperation = config.isOverridenMethod(operation);
        if (isOverrideOperation) {
          callOperation = 'post';
          callHeaders = _.extend(callHeaders, {'X-HTTP-Method-Override': operation === 'remove' ? 'DELETE' : operation});
        } else if (config.jsonp && callOperation === 'get') {
          callOperation = 'jsonp';
        }

        if (config.isSafe(operation)) {
          if (isOverrideOperation) {
            urlHandler.resource(this, $http, request.httpConfig, callHeaders, request.params,
              what, etag, callOperation)[callOperation]({}).then(okCallback, errorCallback);
          } else {
            urlHandler.resource(this, $http, request.httpConfig, callHeaders, request.params,
              what, etag, callOperation)[callOperation]().then(okCallback, errorCallback);
          }
        } else {
          urlHandler.resource(this, $http, request.httpConfig, callHeaders, request.params,
            what, etag, callOperation)[callOperation](request.element).then(okCallback, errorCallback);
        }

        return PromiseExtension(deferred.promise, false, filledObject);
      }


      function withConfigurationFunction(configurer) {
        var newConfig = angular.copy(_.omit(config, 'configuration'));
        Configurer.init(newConfig, newConfig);
        configurer(newConfig);
        return createServiceForConfiguration(newConfig);
      }

      function toService(route, parent) {
        var knownCollectionMethods = _.values(config.restangularFields);
        var serv = {};
        var collection = (parent || service).all(route);
        serv.one = _.bind(one, (parent || service), parent, route);
        serv.post = _.bind(collection.post, collection);
        serv.getList = _.bind(collection.getList, collection);

        for (var prop in collection) {
          if (collection.hasOwnProperty(prop) && _.isFunction(collection[prop]) && !_.contains(knownCollectionMethods, prop)) {
            serv[prop] = _.bind(collection[prop], collection);
          }
        }

        return serv;
      }


      Configurer.init(service, config);

      service.copy = function (elem) {
        return elem.clone();
      };

      service.service = _.bind(toService, service);

      service.withConfig = _.bind(withConfigurationFunction, service);

      service.one = _.bind(one, service, null);

      service.all = _.bind(all, service, null);

      service.several = _.bind(several, service, null);

      service.oneUrl = _.bind(oneUrl, service, null);

      service.allUrl = _.bind(allUrl, service, null);

      service.stripRestangular = _.bind(stripRestangular, service);

      service.restangularizeElement = _.bind(restangularizeElem, service);

      service.restangularizeCollection = _.bind(restangularizeCollectionAndElements, service);

      return service;
    }

    return createServiceForConfiguration(globalConfiguration);
  }];
});
