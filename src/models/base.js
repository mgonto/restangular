function RestangularBase() {

}

RestangularBase.prototype.getRestangularUrl = function () {
  return this.$service.urlHandler.fetchUrl(this);
};
RestangularBase.prototype.getRequestedUrl = function () {
  return this.$service.urlHandler.fetchRequestedUrl(this);
};
RestangularBase.prototype.clone = function () {
  var copiedElement = _.cloneDeep(this);
  // TODO remove restangularizeElem() call
  return this.$service.restangularizeElem(copiedElement[this.$config.restangularFields.parentResource],
    copiedElement, copiedElement[this.$config.restangularFields.route], true);
};

RestangularBase.prototype.addRestangularMethod = function (name, operation, path, defaultParams, defaultHeaders, defaultElem) {
  var bindedFunction;
  if (operation === 'getList') {
    bindedFunction = _.bind(this.$service.fetchList, this.$service, this, path);
  } else {
    bindedFunction = _.bind(customFunction, this, operation, path);
  }

  var createdFunction = function (params, headers, elem) {
    var callParams = _.defaults({
      params: params,
      headers: headers,
      elem: elem
    }, {
      params: defaultParams,
      headers: defaultHeaders,
      elem: defaultElem
    });
    return bindedFunction(callParams.params, callParams.headers, callParams.elem);
  };

  if (utils.isSafeOperation(operation)) {
    this[name] = createdFunction;
  } else {
    this[name] = function (elem, params, headers) {
      return createdFunction(params, headers, elem);
    };
  }
};

RestangularBase.prototype.plain = function () {
  this.$service.stripRestangular(this);
};

RestangularBase.prototype.one = function (/*parent, route, id, singleOne*/) {
  return this.$service.one.apply(this.$service, [this].concat(arguments));
};

RestangularBase.prototype.all = function (/*parent, route*/) {
  return this.$service.all.apply(this.$service, [this].concat(arguments));
};

RestangularBase.prototype.several = function (/*parent, route , ..ids */) {
  return this.$service.several.apply(this.$service, [this].concat(arguments));
};

RestangularBase.prototype.oneUrl = function (/*parent, route, url*/) {
  console.log('holaa');
  return this.$service.oneUrl.apply(this.$service, [this].concat(arguments));
};

RestangularBase.prototype.allUrl = function (/*parent, route, url*/) {
  return this.$service.allUrl.apply(this.$service, [this].concat(arguments));
};

RestangularBase.prototype.remove = function (params, headers) {
  return this.$service.elemFunction(this, 'remove', undefined, params, undefined, headers);
};

RestangularBase.prototype.head = function (params, headers) {
  return this.$service.elemFunction(this, 'head', undefined, params, undefined, headers);
};

RestangularBase.prototype.trace = function (params, headers) {
//  return this.$service.elemFunction(this, 'trace', undefined, params, undefined, headers);
};

RestangularBase.prototype.options = function (params, headers) {
  return this.$service.elemFunction(this, 'options', undefined, params, undefined, headers);
};

RestangularBase.prototype.patch = function (elem, params, headers) {
  return this.$service.elemFunction(this, 'patch', undefined, params, elem, headers);
};


RestangularBase.prototype.restangularized = true;

// TODO should this be public?
RestangularBase.prototype.customOperation = function (operation, path, params, headers, elem) {
  return this.$service.elemFunction(this, operation, path, params, elem, headers);
};

// TODO check expected attributes. elem?
RestangularBase.prototype.doGET = function (path, params, headers, elem) {
  return this.customOperation('get', path, params, headers, elem);
};

// TODO check expected attributes. elem?
RestangularBase.prototype.doDELETE = function (path, params, headers, elem) {
  return this.customOperation('remove', path, params, headers, elem);
};

RestangularBase.prototype.doPUT = function (elem, path, params, headers) {
  return this.customOperation('put', path, params, headers, elem);
};

RestangularBase.prototype.doPOST = function (elem, path, params, headers) {
  return this.customOperation('post', path, params, headers, elem);
};

RestangularBase.prototype.doGETLIST = function (what, params, headers) {
  return this.$service.fetchList(this, what, params, headers);
};

RestangularBase.prototype.withHttpConfig = function (httpConfig) {
  this._$httpConfig = httpConfig;
  return this;
};

RestangularBase.prototype.customGET = RestangularBase.prototype.doGET;
RestangularBase.prototype.customPUT = RestangularBase.prototype.doPUT;
RestangularBase.prototype.customDELETE = RestangularBase.prototype.doDELETE;
RestangularBase.prototype.customPOST = RestangularBase.prototype.doPOST;
RestangularBase.prototype.customGETLIST = RestangularBase.prototype.doGETLIST;