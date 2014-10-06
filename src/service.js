function RestangularService(config) {
  this.config = config;
  this.urlHandler = new config.urlCreatorFactory[config.urlCreator]();
  this.urlHandler.setConfig(config);
  Configurer.init(this, config);
}

RestangularService.prototype.one = function(parent, route, id, singleOne) {
  if (_.isNumber(route) || _.isNumber(parent)) {
    var error = 'You\'re creating a Restangular entity with the number ';
    error += 'instead of the route or the parent. For example, you can\'t call .one(12)';
    throw new Error(error);
  }
  var elem = {};
  this.config.setIdToElem(elem, id, route);
  this.config.setFieldToElem(this.config.restangularFields.singleOne, elem, singleOne);
  return this.restangularizeElem(parent, elem , route, false);
};

RestangularService.prototype.all = function(parent, route) {
  return this.restangularizeCollection(parent, [] , route, false);
};

RestangularService.prototype.several = function(parent, route /*, ids */) {
  var collection = [];
  collection[this.config.restangularFields.ids] = Array.prototype.splice.call(arguments, 2);
  return this.restangularizeCollection(parent, collection , route, false);
};

RestangularService.prototype.oneUrl = function(parent, route, url) {
  if (!route) {
    throw new Error('Route is mandatory when creating new Restangular objects.');
  }
  var elem = {};
  this.config.setUrlToElem(elem, url, route);
  return this.restangularizeElem(parent, elem , route, false);
};


RestangularService.prototype.allUrl = function(parent, route, url) {
  if (!route) {
    throw new Error('Route is mandatory when creating new Restangular objects.');
  }
  var elem = {};
  this.config.setUrlToElem(elem, url, route);
  return this.restangularizeCollection(parent, elem , route, false);
};

RestangularService.prototype.restangularizeBase = function (parent, elem, route, reqParams, fromServer) {

  elem[this.config.restangularFields.route] = route;

  elem[this.config.restangularFields.reqParams] = _.isEmpty(reqParams) ? null : reqParams;
  elem[this.config.restangularFields.withHttpConfig] = _.bind(withHttpConfig, elem);


  // RequestLess connection
  elem[this.config.restangularFields.fromServer] = !!fromServer;

  if (parent && this.config.shouldSaveParent(route)) {
    var parentId = this.config.getIdFromElem(parent);
    var parentUrl = this.config.getUrlFromElem(parent);

    var restangularFieldsForParent = _.union(
      _.values( _.pick(this.config.restangularFields, ['route', 'singleOne', 'parentResource']) ),
      this.config.extraFields
    );
    var parentResource = _.pick(parent, restangularFieldsForParent);

    if (this.config.isValidId(parentId)) {
      this.config.setIdToElem(parentResource, parentId, route);
    }
    if (this.config.isValidId(parentUrl)) {
      this.config.setUrlToElem(parentResource, parentUrl, route);
    }

    elem[this.config.restangularFields.parentResource] = parentResource;
  } else {
    elem[this.config.restangularFields.parentResource] = null;
  }
  return elem;
};

RestangularService.prototype.restangularizeElem = function (parent, element, route, fromServer, collection, reqParams) {
  var elem = this.config.onBeforeElemRestangularized(element, false, route);

  // TODO Change later to use another strategy
  elem.__proto__ = new RestangularElement(this);
  var localElem = this.restangularizeBase(parent, elem, route, reqParams, fromServer);

  if (this.config.useCannonicalId) {
    localElem[this.config.restangularFields.cannonicalId] = this.config.getIdFromElem(localElem);
  }

  if (collection) {
    localElem[this.config.restangularFields.getParentList] = function() {
      return collection;
    };
  }

  return this.config.transformElem(localElem, false, route, service, true);
};

RestangularService.prototype.restangularizeCollection = function (parent, element, route, fromServer, reqParams) {
  var elem = this.config.onBeforeElemRestangularized(element, true, route);

  // TODO Change later to use another strategy
  elem.__proto__ = new RestangularCollection(this);

  var localElem = this.restangularizeBase(parent, elem, route, reqParams, fromServer);

  return this.config.transformElem(localElem, true, route, service, true);
};

RestangularService.prototype.restangularizeCollectionAndElements = function (parent, element, route) {
  var collection = this.restangularizeCollection(parent, element, route, false);
  _.each(collection, function(elem) {
    this.restangularizeElem(parent, elem, route, false);
  }, this);
  return collection;
};

// Elements
RestangularService.prototype.stripRestangular = function (elem) {
  if (_.isArray(elem)) {
    var array = [];
    _.each(elem, function(value) {
      array.push(this.config.isRestangularized(value) ?  this.stripRestangular(value) : value);
    }, this);
    return array;
  } else {
    // TODO change the removal of RestangularBase properties
    return _.omit(
      _.omit(elem, _.values(_.omit(this.config.restangularFields, 'id'))),
      '$config', '$urlHandler', '$restangularizeElem'
    );
  }
};

RestangularService.prototype.fetchList = function (baseElem, what, reqParams, headers) {
  var __this = this;

  // FIXME we can't use $q here
  var deferred = $q.defer();

  var operation = 'getList';
  var url = this.urlHandler.fetchUrl(baseElem, what);
  var whatFetched = what || baseElem[this.config.restangularFields.route];

  var request = this.config.fullRequestInterceptor(null, operation,
    whatFetched, url, headers || {}, reqParams || {}, baseElem[this.config.restangularFields.httpConfig] || {});

  // FIXME service is undefined and it should be the 'Restangular' instance
  var filledArray = [];
  filledArray = this.config.transformElem(filledArray, true, whatFetched, service);

  var method = 'getList';

  if (config.jsonp) {
    method = 'jsonp';
  }

  var okCallback = function(response) {
    var resData = response.data;
    var fullParams = response.config.params;
    var data = __this.parseResponse(resData, operation, whatFetched, url, response, deferred);

    // support empty response for getList() calls (some APIs respond with 204 and empty body)
    if (_.isUndefined(data) || '' === data) {
      data = [];
    }
    if (!_.isArray(data)) {
      throw new Error('Response for getList SHOULD be an array and not an object or something else');
    }
    var processedData = _.map(data, function(elem) {
      if (!baseElem.restangularCollection) {
        return __this.restangularizeElem(baseElem, elem, what, true, data);
      } else {
        return __this.restangularizeElem(baseElem[__this.config.restangularFields.parentResource],
          elem, baseElem[__this.config.restangularFields.route], true, data);
      }
    });

    processedData = _.extend(data, processedData);

    if (!baseElem.restangularCollection) {
      __this.resolvePromise(
        deferred,
        response,
        __this.restangularizeCollection(
          baseElem,
          processedData,
          what,
          true,
          fullParams
        ),
        filledArray
      );
    } else {
      __this.resolvePromise(
        deferred,
        response,
        __this.restangularizeCollection(
          baseElem[__this.config.restangularFields.parentResource],
          processedData,
          baseElem[__this.config.restangularFields.route],
          true,
          fullParams
        ),
        filledArray
      );
    }
  };

  // FIXME we can't use $http here
  urlHandler.resource(this, $http, request.httpConfig, request.headers, request.params, what,
    baseElem[__this.config.restangularFields.etag], operation)[method]().then(okCallback, function error(response) {
    if (response.status === 304 && baseElem.restangularCollection) {
      __this.resolvePromise(deferred, response, baseElem, filledArray);
    } else if ( _.every(__this.config.errorInterceptors, function(cb) { return cb(response, deferred, okCallback) !== false; }) ) {
      // triggered if no callback returns false
      deferred.reject(response);
    }
  });

  return PromiseExtension(deferred.promise, true, filledArray);
};


RestangularService.prototype.elemFunction = function (baseElement, operation, what, params, obj, headers) {
  var __this = this;

  // FIXME don't use $q here
  var deferred = $q.defer();

  var resParams = params || {};
  var route = what || baseElement[this.config.restangularFields.route];
  var fetchUrl = this.urlHandler.fetchUrl(baseElement, what);

  var callObj = obj || baseElement;
  // fallback to etag on restangular object (since for custom methods we probably don't explicitly specify the etag field)
  var etag = callObj[this.config.restangularFields.etag] || (operation !== 'post' ? baseElement[this.config.restangularFields.etag] : null);

  if (_.isObject(callObj) && this.config.isRestangularized(callObj)) {
    callObj = stripRestangular(callObj);
  }
  var request = this.config.fullRequestInterceptor(callObj, operation, route, fetchUrl,
      headers || {}, resParams || {}, baseElement[this.config.restangularFields.httpConfig] || {});

  // FIXME replace service with something else
  var filledObject = {};
  filledObject = this.config.transformElem(filledObject, false, route, service);

  var okCallback = function(response) {
    var resData = response.data;
    var fullParams = response.config.params;
    var elem = __this.parseResponse(resData, operation, route, fetchUrl, response, deferred);
    if (elem) {

      if (operation === 'post' && !__this[config.restangularFields.restangularCollection]) {
        __this.resolvePromise(deferred, response, __this.restangularizeElem(baseElement, elem, what, true, null, fullParams), filledObject);
      } else {
        var data = __this.restangularizeElem(
          baseElement[__this.config.restangularFields.parentResource],
          elem,
          baseElement[__this.config.restangularFields.route],
          true,
          null,
          fullParams
        );

        data[__this.config.restangularFields.singleOne] = baseElement[__this.config.restangularFields.singleOne];
        __this.resolvePromise(deferred, response, data, filledObject);
      }

    } else {
      __this.resolvePromise(deferred, response, undefined, filledObject);
    }
  };

  var errorCallback = function(response) {
    if (response.status === 304 && __this.config.isSafe(operation)) {
      __this.resolvePromise(deferred, response, __this, filledObject);
    } else if ( _.every(config.errorInterceptors, function(cb) { return cb(response, deferred, okCallback) !== false; }) ) {
      // triggered if no callback returns false
      deferred.reject(response);
    }
  };
  // Overring HTTP Method
  var callOperation = operation;
  var callHeaders = _.extend({}, request.headers);
  var isOverrideOperation = __this.config.isOverridenMethod(operation);
  if (isOverrideOperation) {
    callOperation = 'post';
    callHeaders = _.extend(callHeaders, {'X-HTTP-Method-Override': operation === 'remove' ? 'DELETE' : operation});
  } else if (config.jsonp && callOperation === 'get') {
    callOperation = 'jsonp';
  }

  // FIXME don't use $http here
  if (__this.config.isSafe(operation)) {
    if (isOverrideOperation) {
      this.urlHandler.resource(baseElement, $http, request.httpConfig, callHeaders, request.params,
        what, etag, callOperation)[callOperation]({}).then(okCallback, errorCallback);
    } else {
      this.urlHandler.resource(baseElement, $http, request.httpConfig, callHeaders, request.params,
        what, etag, callOperation)[callOperation]().then(okCallback, errorCallback);
    }
  } else {
    this.urlHandler.resource(baseElement, $http, request.httpConfig, callHeaders, request.params,
      what, etag, callOperation)[callOperation](request.element).then(okCallback, errorCallback);
  }

  return PromiseExtension(deferred.promise, false, filledObject);
};

// TODO Make private or remove config dependency
RestangularService.prototype.resolvePromise = function (deferred, response, data, filledValue) {
  _.extend(filledValue, data);

  // Trigger the full response interceptor.
  if (this.config.fullResponse) {
    return deferred.resolve(_.extend(response, {
      data: data
    }));
  } else {
    deferred.resolve(data);
  }
};

// TODO Make private or remove config dependency
RestangularService.prototype.parseResponse = function (resData, operation, route, fetchUrl, response, deferred) {
  var data = this.config.responseExtractor(resData, operation, route, fetchUrl, response, deferred);
  var etag = response.headers('ETag');
  if (data && etag) {
    data[this.config.restangularFields.etag] = etag;
  }
  return data;
};

// TODO remove dependency to angular.copy
RestangularService.prototype.withConfig = function (configurer) {
  var newConfig = angular.copy(_.omit(this.config, 'configuration'));
  Configurer.init(newConfig, newConfig);
  configurer(newConfig);
  return new RestangularService(newConfig).asPublicAdapter();
};

RestangularService.prototype.asPublicAdapter = function() {
  if (this._publicAdapter == null) {
    this._publicAdapter = createPublicAdapter(this);
  }
  return this._publicAdapter;
};

RestangularService.prototype.copy = function (elem) {
  return elem.clone();
};

// TODO review this method (I don't know what is for)
RestangularService.prototype.service = function(route, parent) {
  var knownCollectionMethods = _.values(this.config.restangularFields);
  var serv = {};
  var collection = (parent || this).all(route);
  serv.one = _.bind(one, (parent || this), parent, route);
  serv.post = _.bind(collection.post, collection);
  serv.getList = _.bind(collection.getList, collection);

  for (var prop in collection) {
    if (collection.hasOwnProperty(prop) && _.isFunction(collection[prop]) && !_.contains(knownCollectionMethods, prop)) {
      serv[prop] = _.bind(collection[prop], collection);
    }
  }

  return serv;
};

function createPublicAdapter(service) {
  var adapter = {};

  ['service', 'withConfig', 'stripRestangular', 'restangularizeElement', 'restangularizeCollection']
    .forEach(function (fn) {
      adapter[fn] = service[fn].bind(service);
  });

  ['one', 'all', 'several', 'oneUrl', 'allUrl'].forEach(function (fn) {
    adapter[fn] = service[fn].bind(service, null);
  });

  return adapter;
}

