function RestangularService(config) {
  this.config = config;
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

  localElem[this.config.restangularFields.restangularCollection] = false;
  localElem[this.config.restangularFields.getList] = _.bind(fetchFunction, localElem);


  addCustomOperation(localElem);
  return this.config.transformElem(localElem, false, route, service, true);
};

RestangularService.prototype.restangularizeCollection = function (parent, element, route, fromServer, reqParams) {
  var elem = this.config.onBeforeElemRestangularized(element, true, route);

  // TODO Change later to use another strategy
  elem.__proto__ = new RestangularCollection(this);

  var localElem = this.restangularizeBase(parent, elem, route, reqParams, fromServer);
  localElem[this.config.restangularFields.restangularCollection] = true;


  localElem[this.config.restangularFields.get] = _.bind(getById, localElem);
  localElem[this.config.restangularFields.getList] = _.bind(fetchFunction, localElem, null);

  addCustomOperation(localElem);
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