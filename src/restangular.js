var module = angular.module('restangular', ['ngResource']);

module.provider('Restangular', function() {
        // Configuration
        /**
         * This is the BaseURL to be used with Restangular
         */
        this.baseUrl = null;
        this.setBaseUrl = function(baseUrl) {
            this.baseUrl = baseUrl;
        }
        
        /**
         * Sets the extra fields to keep from the parents
         */
        this.extraFields = [];
        this.setExtraFields = function(extraFields) {
            this.extraFields = extraFields;
        }
        
        /**
         * Sets the URL creator type
         */
        this.urlCreator = "path";
        this.setUrlCreator = function(name) {
            if (!_.has(urlCreatorFactory, name)) {
                throw new Error("URL Path selected isn't valid");
            }
            this.urlCreator = name;
        }
        
        //Internal values and functions
        var urlCreatorFactory = {};
        
        var Path = function(baseUrl) {
            this.baseUrl = baseUrl;
        }
        
        Path.prototype.base = function(current) {
            return this.baseUrl + _.reduce(this.parentsArray(current), function(acum, elem) {
                return acum + "/" + elem.route + "/" + elem.id;
            }, '');
        }
        
        Path.prototype.parentsArray = function(current) {
            var parents = [];
            while(!_.isUndefined(current)) {
                parents.push(current);
                current = current.parentResource;
            }
            return parents.reverse();
        }
        
        Path.prototype.fetchUrl = function(what, current) {
            return this.base(current) + "/" + what.toLowerCase();
        }
        
        Path.prototype.resource = function(current, $resource) {
            return $resource(this.base(current) + "/:what" , {}, {
                getArray: {method: 'GET', params: {}, isArray: true},
                get: {method: 'GET', params: {}, isArray: false},
                put: {method: 'PUT', params: {}, isArray: false},
                remove: {method: 'DELETE', params: {}, isArray: false}
            });
        }
        
        urlCreatorFactory.path = Path;
        
        
        
       this.$get = ['$resource', '$q', function($resource, $q) {
          var urlHandler = new urlCreatorFactory[this.urlCreator](this.baseUrl);
          var __extraFields = this.extraFields;
          
          function restangularize(parent, elem, route) {
              elem.route = route;
              elem.fetch = _.bind(fetchFunction, elem);
              elem.get = _.bind(getFunction, elem);
              elem.update = _.bind(putFunction, elem);
              elem.remove = _.bind(deleteFunction, elem);
              
              if (parent) {
                  elem.parentResource = _.pick(parent, _.union(['id', 'route', 'parentResource'], __extraFields));
              }
              return elem;
          }
          
          function fetchFunction(what) {
              var __this = this;
              var deferred = $q.defer();
              
              urlHandler.resource(this, $resource).getArray({what: what}, function(data) {
                  var processedData = _.map(data, function(elem) {
                      return restangularize(__this, elem, what);
                  });
                  deferred.resolve(processedData);
              }, function error() {
                  deferred.reject(arguments)
              });
              
              return deferred.promise;
          }
          
          function elemFunction(operation, params, obj) {
              var __this = this;
              var deferred = $q.defer();
              var resParams = params || {};
              var resObj = obj || this;
              
              var okCallback = function(elem) {
                  if (elem) {
                      deferred.resolve(restangularize(__this.parentResource, elem, __this.route));
                  } else {
                      deferred.resolve();
                  }
              };
              
              var errorCallback = function() {
                  deferred.reject(arguments)
              };
              
              if (operation === 'get') {
                  urlHandler.resource(this, $resource)[operation](resParams, okCallback, errorCallback);
              } else {
                  urlHandler.resource(this, $resource)[operation](resParams, resObj, okCallback, errorCallback);
              }
              
              return deferred.promise;
          }
          
          function getFunction(params) {
              return _.bind(elemFunction, this)("get", params);;
          }
          
          function deleteFunction(params) {
              return _.bind(elemFunction, this)("remove", params, {});
          }
          
          function putFunction(params) {
              return _.bind(elemFunction, this)("put", params);
          }
          
          
          var service = {};
          
          service.create = function(route, id) {
              return restangularize(null, {
                  id: id
              }, route);
          }
          
          return service;
       
        }];
    }
);

