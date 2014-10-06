
var RestangularBase = {
  getRestangularUrl: function() {
    return this.$service.urlHandler.fetchUrl(this);
  },
  getRequestedUrl: function() {
    return this.$service.urlHandler.fetchRequestedUrl(this);
  },
  clone: function() {
    var copiedElement = _.cloneDeep(this);
    // TODO remove restangularizeElem() call
    return this.$service.restangularizeElem(copiedElement[this.$config.restangularFields.parentResource],
            copiedElement, copiedElement[this.$config.restangularFields.route], true);
  },

  addRestangularMethod: function (name, operation, path, defaultParams, defaultHeaders, defaultElem) {
    var bindedFunction;
    if (operation === 'getList') {
      bindedFunction = _.bind(this.$service.fetchList, this.$service, this, path);
    } else {
      bindedFunction = _.bind(customFunction, this, operation, path);
    }

    var createdFunction = function(params, headers, elem) {
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

    if (this.$config.isSafe(operation)) {
      this[name] = createdFunction;
    } else {
      this[name] = function(elem, params, headers) {
        return createdFunction(params, headers, elem);
      };
    }
  },

  plain: function() {
    this.$service.stripRestangular(this);
  },

  one: function(/*parent, route, id, singleOne*/) {
    return this.$service.one.apply(this.$service, [this].concat(arguments));
  },

  all:function(/*parent, route*/) {
    return this.$service.all.apply(this.$service, [this].concat(arguments));
  },

  several: function(/*parent, route , ..ids */) {
    return this.$service.several.apply(this.$service, [this].concat(arguments));
  },

  oneUrl: function(/*parent, route, url*/) {
    return this.$service.oneUrl.apply(this.$service, [this].concat(arguments));
  },

  allUrl: function(/*parent, route, url*/) {
    return this.$service.allUrl.apply(this.$service, [this].concat(arguments));
  },

  remove:function (params, headers) {
    return _.bind(elemFunction, this)('remove', undefined, params, undefined, headers);
  },

   head: function (params, headers) {
    return _.bind(elemFunction, this)('head', undefined, params, undefined, headers);
  },

  trace: function (params, headers) {
    return _.bind(elemFunction, this)('trace', undefined, params, undefined, headers);
  },

  options: function (params, headers) {
    return _.bind(elemFunction, this)('options', undefined, params, undefined, headers);
  },

  patch: function (elem, params, headers) {
    return _.bind(elemFunction, this)('patch', undefined, params, elem, headers);
  },

  restangularized: true,

  // TODO should this be public?
  customOperation: function(operation, path, params, headers, elem) {
    return _.bind(elemFunction, this)(operation, path, params, elem, headers);
  },

  // TODO check expected attributes. elem?
  doGET: function(path, params, headers, elem) {
    return this.customOperation('get', path, params, headers, elem);
  },

  // TODO check expected attributes. elem?
  doDELETE: function(path, params, headers, elem) {
    return this.customOperation('remove', path, params, headers, elem);
  },

  doPUT: function(elem, path, params, headers) {
    return this.customOperation('put', path, params, headers, elem);
  },

  doPOST: function(elem, path, params, headers) {
    return this.customOperation('post', path, params, headers, elem);
  },

  doGETLIST: function(what, params, headers) {
    return this.$service.fetchList(this, what, params, headers);
  },

  withHttpConfig: function (httpConfig) {
    this._$httpConfig = httpConfig;
    return this;
  }
};

RestangularBase.customGET = RestangularBase.doGET;
RestangularBase.customPUT = RestangularBase.doPUT;
RestangularBase.customDELETE = RestangularBase.doDELETE;
RestangularBase.customPOST = RestangularBase.doPOST;
RestangularBase.customGETLIST = RestangularBase.doGETLIST;