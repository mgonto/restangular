function RestangularService(config) {
  this.config = config;
  this.urlHandler = new config.urlCreatorFactory[config.urlCreator]();
  this.urlHandler.setConfig(config);
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
    });
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
    var data = parseResponse(resData, operation, whatFetched, url, response, deferred);

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
      resolvePromise(
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
      resolvePromise(
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
      resolvePromise(deferred, response, baseElem, filledArray);
    } else if ( _.every(__this.config.errorInterceptors, function(cb) { return cb(response, deferred, okCallback) !== false; }) ) {
      // triggered if no callback returns false
      deferred.reject(response);
    }
  });

  return PromiseExtension(deferred.promise, true, filledArray);
}
