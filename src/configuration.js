// Configuration
var Configurer = {};
Configurer.init = function (object, config) {
  object.configuration = config;

  /**
   * Those are HTTP safe methods for which there is no need to pass any data with the request.
   */
  var safeMethods = ['get', 'head', 'options', 'trace', 'getlist'];
  config.isSafe = function (operation) {
    return _.contains(safeMethods, operation.toLowerCase());
  };

  var absolutePattern = /^https?:\/\//i;
  config.isAbsoluteUrl = function (string) {
    return _.isUndefined(config.absoluteUrl) || _.isNull(config.absoluteUrl) ?
      string && absolutePattern.test(string) :
      config.absoluteUrl;
  };

  config.absoluteUrl = _.isUndefined(config.absoluteUrl) ? true : config.absoluteUrl;
  object.setSelfLinkAbsoluteUrl = function (value) {
    config.absoluteUrl = value;
  };
  /**
   * This is the BaseURL to be used with Restangular
   */
  config.baseUrl = _.isUndefined(config.baseUrl) ? '' : config.baseUrl;
  object.setBaseUrl = function (newBaseUrl) {
    config.baseUrl = /\/$/.test(newBaseUrl) ?
      newBaseUrl.substring(0, newBaseUrl.length - 1) :
      newBaseUrl;
    return this;
  };

  /**
   * Sets the extra fields to keep from the parents
   */
  config.extraFields = config.extraFields || [];
  object.setExtraFields = function (newExtraFields) {
    config.extraFields = newExtraFields;
    return this;
  };

  /**
   * Some default $http parameter to be used in EVERY call
   **/
  config.defaultHttpFields = config.defaultHttpFields || {};
  object.setDefaultHttpFields = function (values) {
    config.defaultHttpFields = values;
    return this;
  };

  config.withHttpValues = function (httpLocalConfig, obj) {
    return _.defaults(obj, httpLocalConfig, config.defaultHttpFields);
  };

  config.encodeIds = _.isUndefined(config.encodeIds) ? true : config.encodeIds;
  object.setEncodeIds = function (encode) {
    config.encodeIds = encode;
  };

  config.defaultRequestParams = config.defaultRequestParams || {
    get: {},
    post: {},
    put: {},
    remove: {},
    common: {}
  };

  object.setDefaultRequestParams = function (param1, param2) {
    var methods = [],
      params = param2 || param1;
    if (!_.isUndefined(param2)) {
      if (_.isArray(param1)) {
        methods = param1;
      } else {
        methods.push(param1);
      }
    } else {
      methods.push('common');
    }

    _.each(methods, function (method) {
      config.defaultRequestParams[method] = params;
    });
    return this;
  };

  object.requestParams = config.defaultRequestParams;

  config.defaultHeaders = config.defaultHeaders || {};
  object.setDefaultHeaders = function (headers) {
    config.defaultHeaders = headers;
    object.defaultHeaders = config.defaultHeaders;
    return this;
  };

  object.defaultHeaders = config.defaultHeaders;

  /**
   * Method overriders will set which methods are sent via POST with an X-HTTP-Method-Override
   **/
  config.methodOverriders = config.methodOverriders || [];
  object.setMethodOverriders = function (values) {
    var overriders = _.extend([], values);
    if (config.isOverridenMethod('delete', overriders)) {
      overriders.push('remove');
    }
    config.methodOverriders = overriders;
    return this;
  };

  config.jsonp = _.isUndefined(config.jsonp) ? false : config.jsonp;
  object.setJsonp = function (active) {
    config.jsonp = active;
  };

  config.isOverridenMethod = function (method, values) {
    var search = values || config.methodOverriders;
    return !_.isUndefined(_.find(search, function (one) {
      return one.toLowerCase() === method.toLowerCase();
    }));
  };

  /**
   * Sets the URL creator type. For now, only Path is created. In the future we'll have queryParams
   **/
  config.urlCreator = config.urlCreator || 'path';
  object.setUrlCreator = function (name) {
    if (!_.has(config.urlCreatorFactory, name)) {
      throw new Error('URL Path selected isn\'t valid');
    }

    config.urlCreator = name;
    return this;
  };

  /**
   * You can set the restangular fields here. The 3 required fields for Restangular are:
   *
   * id: Id of the element
   * route: name of the route of this element
   * parentResource: the reference to the parent resource
   *
   *  All of this fields except for id, are handled (and created) by Restangular. By default,
   *  the field values will be id, route and parentResource respectively
   */
  config.restangularFields = config.restangularFields || {
    id: 'id',
    route: 'route',
    parentResource: 'parentResource',
    restangularCollection: 'restangularCollection',
    cannonicalId: '__cannonicalId',
    etag: 'restangularEtag',
    selfLink: 'href',
    getParentList: 'getParentList',
    ids: 'ids',
    httpConfig: '_$httpConfig',
    reqParams: 'reqParams',
    fromServer: 'fromServer',
    singleOne: 'singleOne',
    restangularized: 'restangularized'
  };
  object.setRestangularFields = function (resFields) {
    config.restangularFields =
      _.extend(config.restangularFields, resFields);
    return this;
  };

  config.isRestangularized = function (obj) {
    return !!obj[config.restangularFields.restangularized];
  };

  config.setFieldToElem = function (field, elem, value) {
    var properties = field.split('.');
    var idValue = elem;
    _.each(_.initial(properties), function (prop) {
      idValue[prop] = {};
      idValue = idValue[prop];
    });
    idValue[_.last(properties)] = value;
    return this;
  };

  config.getFieldFromElem = function (field, elem) {
    var properties = field.split('.');
    var idValue = elem;
    _.each(properties, function (prop) {
      if (idValue) {
        idValue = idValue[prop];
      }
    });
    return angular.copy(idValue);
  };

  config.setIdToElem = function (elem, id /*, route */) {
    config.setFieldToElem(config.restangularFields.id, elem, id);
    return this;
  };

  config.getIdFromElem = function (elem) {
    return config.getFieldFromElem(config.restangularFields.id, elem);
  };

  config.isValidId = function (elemId) {
    return '' !== elemId && !_.isUndefined(elemId) && !_.isNull(elemId);
  };

  config.setUrlToElem = function (elem, url /*, route */) {
    config.setFieldToElem(config.restangularFields.selfLink, elem, url);
    return this;
  };

  config.getUrlFromElem = function (elem) {
    return config.getFieldFromElem(config.restangularFields.selfLink, elem);
  };

  config.useCannonicalId = _.isUndefined(config.useCannonicalId) ? false : config.useCannonicalId;
  object.setUseCannonicalId = function (value) {
    config.useCannonicalId = value;
    return this;
  };

  config.getCannonicalIdFromElem = function (elem) {
    var cannonicalId = elem[config.restangularFields.cannonicalId];
    var actualId = config.isValidId(cannonicalId) ? cannonicalId : config.getIdFromElem(elem);
    return actualId;
  };

  /**
   * Sets the Response parser. This is used in case your response isn't directly the data.
   * For example if you have a response like {meta: {'meta'}, data: {name: 'Gonto'}}
   * you can extract this data which is the one that needs wrapping
   *
   * The ResponseExtractor is a function that receives the response and the method executed.
   */

  config.responseInterceptors = config.responseInterceptors || [];

  config.defaultResponseInterceptor = function (data /*, operation, what, url, response, deferred */) {
    return data;
  };

  config.responseExtractor = function (data, operation, what, url, response, deferred) {
    var interceptors = angular.copy(config.responseInterceptors);
    interceptors.push(config.defaultResponseInterceptor);
    var theData = data;
    _.each(interceptors, function (interceptor) {
      theData = interceptor(theData, operation,
        what, url, response, deferred);
    });
    return theData;
  };

  object.addResponseInterceptor = function (extractor) {
    config.responseInterceptors.push(extractor);
    return this;
  };

  config.errorInterceptors = config.errorInterceptors || [];
  object.addErrorInterceptor = function (interceptor) {
    config.errorInterceptors.push(interceptor);
    return this;
  };

  object.setResponseInterceptor = object.addResponseInterceptor;
  object.setResponseExtractor = object.addResponseInterceptor;
  object.setErrorInterceptor = object.addErrorInterceptor;

  /**
   * Response interceptor is called just before resolving promises.
   */


  /**
   * Request interceptor is called before sending an object to the server.
   */
  config.requestInterceptors = config.requestInterceptors || [];

  config.defaultInterceptor = function (element, operation, path, url, headers, params, httpConfig) {
    return {
      element: element,
      headers: headers,
      params: params,
      httpConfig: httpConfig
    };
  };

  config.fullRequestInterceptor = function (element, operation, path, url, headers, params, httpConfig) {
    var interceptors = angular.copy(config.requestInterceptors);
    var defaultRequest = config.defaultInterceptor(element, operation, path, url, headers, params, httpConfig);
    return _.reduce(interceptors, function (request, interceptor) {
      return _.extend(request, interceptor(request.element, operation,
        path, url, request.headers, request.params, request.httpConfig));
    }, defaultRequest);
  };

  object.addRequestInterceptor = function (interceptor) {
    config.requestInterceptors.push(function (elem, operation, path, url, headers, params, httpConfig) {
      return {
        headers: headers,
        params: params,
        element: interceptor(elem, operation, path, url),
        httpConfig: httpConfig
      };
    });
    return this;
  };

  object.setRequestInterceptor = object.addRequestInterceptor;

  object.addFullRequestInterceptor = function (interceptor) {
    config.requestInterceptors.push(interceptor);
    return this;
  };

  object.setFullRequestInterceptor = object.addFullRequestInterceptor;

  config.onBeforeElemRestangularized = config.onBeforeElemRestangularized || function (elem) {
    return elem;
  };
  object.setOnBeforeElemRestangularized = function (post) {
    config.onBeforeElemRestangularized = post;
    return this;
  };

  object.setRestangularizePromiseInterceptor = function (interceptor) {
    config.restangularizePromiseInterceptor = interceptor;
    return this;
  };

  /**
   * This method is called after an element has been "Restangularized".
   *
   * It receives the element, a boolean indicating if it's an element or a collection
   * and the name of the model
   *
   */
  config.onElemRestangularized = config.onElemRestangularized || function (elem) {
    return elem;
  };
  object.setOnElemRestangularized = function (post) {
    config.onElemRestangularized = post;
    return this;
  };

  config.shouldSaveParent = config.shouldSaveParent || function () {
    return true;
  };
  object.setParentless = function (values) {
    if (_.isArray(values)) {
      config.shouldSaveParent = function (route) {
        return !_.contains(values, route);
      };
    } else if (_.isBoolean(values)) {
      config.shouldSaveParent = function () {
        return !values;
      };
    }
    return this;
  };

  /**
   * This lets you set a suffix to every request.
   *
   * For example, if your api requires that for JSon requests you do /users/123.json, you can set that
   * in here.
   *
   *
   * By default, the suffix is null
   */
  config.suffix = _.isUndefined(config.suffix) ? null : config.suffix;
  object.setRequestSuffix = function (newSuffix) {
    config.suffix = newSuffix;
    return this;
  };

  /**
   * Add element transformers for certain routes.
   */
  config.transformers = config.transformers || {};
  object.addElementTransformer = function (type, secondArg, thirdArg) {
    var isCollection = null;
    var transformer = null;
    if (arguments.length === 2) {
      transformer = secondArg;
    } else {
      transformer = thirdArg;
      isCollection = secondArg;
    }

    var typeTransformers = config.transformers[type];
    if (!typeTransformers) {
      typeTransformers = config.transformers[type] = [];
    }

    typeTransformers.push(function (coll, elem) {
      if (_.isNull(isCollection) || (coll === isCollection)) {
        return transformer(elem);
      }
      return elem;
    });

    return object;
  };

  object.extendCollection = function (route, fn) {
    return object.addElementTransformer(route, true, fn);
  };

  object.extendModel = function (route, fn) {
    return object.addElementTransformer(route, false, fn);
  };

  config.transformElem = function (elem, isCollection, route, Restangular, force) {
    if (!force && !config.transformLocalElements && !elem[config.restangularFields.fromServer]) {
      return elem;
    }
    var typeTransformers = config.transformers[route];
    var changedElem = elem;
    if (typeTransformers) {
      _.each(typeTransformers, function (transformer) {
        changedElem = transformer(isCollection, changedElem);
      });
    }
    return config.onElemRestangularized(changedElem, isCollection, route, Restangular);
  };

  config.transformLocalElements = _.isUndefined(config.transformLocalElements) ?
    false :
    config.transformLocalElements;

  object.setTransformOnlyServerElements = function (active) {
    config.transformLocalElements = !active;
  };

  config.fullResponse = _.isUndefined(config.fullResponse) ? false : config.fullResponse;
  object.setFullResponse = function (full) {
    config.fullResponse = full;
    return this;
  };


  //Internal values and functions
  config.urlCreatorFactory = {};

  /**
   * Base URL Creator. Base prototype for everything related to it
   **/

  var BaseCreator = function () {
  };

  BaseCreator.prototype.setConfig = function (config) {
    this.config = config;
    return this;
  };

  BaseCreator.prototype.parentsArray = function (current) {
    var parents = [];
    while (current) {
      parents.push(current);
      current = current[this.config.restangularFields.parentResource];
    }
    return parents.reverse();
  };

  function RestangularResource(config, $http, url, configurer) {
    var resource = {};
    _.each(_.keys(configurer), function (key) {
      var value = configurer[key];

      // Add default parameters
      value.params = _.extend({}, value.params, config.defaultRequestParams[value.method.toLowerCase()]);
      // We don't want the ? if no params are there
      if (_.isEmpty(value.params)) {
        delete value.params;
      }

      if (config.isSafe(value.method)) {

        resource[key] = function () {
          return $http(_.extend(value, {
            url: url
          }));
        };

      } else {

        resource[key] = function (data) {
          return $http(_.extend(value, {
            url: url,
            data: data
          }));
        };

      }
    });

    return resource;
  }

  BaseCreator.prototype.resource = function (current, $http, localHttpConfig, callHeaders, callParams, what, etag, operation) {

    var params = _.defaults(callParams || {}, this.config.defaultRequestParams.common);
    var headers = _.defaults(callHeaders || {}, this.config.defaultHeaders);

    if (etag) {
      if (!config.isSafe(operation)) {
        headers['If-Match'] = etag;
      } else {
        headers['If-None-Match'] = etag;
      }
    }

    var url = this.base(current);

    if (what) {
      var add = '';
      if (!/\/$/.test(url)) {
        add += '/';
      }
      add += what;
      url += add;
    }

    if (this.config.suffix &&
      url.indexOf(this.config.suffix, url.length - this.config.suffix.length) === -1 && !this.config.getUrlFromElem(current)) {
      url += this.config.suffix;
    }

    current[this.config.restangularFields.httpConfig] = undefined;

    return RestangularResource(this.config, $http, url, {
      getList: this.config.withHttpValues(localHttpConfig,
        {method: 'GET',
          params: params,
          headers: headers}),

      get: this.config.withHttpValues(localHttpConfig,
        {method: 'GET',
          params: params,
          headers: headers}),

      jsonp: this.config.withHttpValues(localHttpConfig,
        {method: 'jsonp',
          params: params,
          headers: headers}),

      put: this.config.withHttpValues(localHttpConfig,
        {method: 'PUT',
          params: params,
          headers: headers}),

      post: this.config.withHttpValues(localHttpConfig,
        {method: 'POST',
          params: params,
          headers: headers}),

      remove: this.config.withHttpValues(localHttpConfig,
        {method: 'DELETE',
          params: params,
          headers: headers}),

      head: this.config.withHttpValues(localHttpConfig,
        {method: 'HEAD',
          params: params,
          headers: headers}),

      trace: this.config.withHttpValues(localHttpConfig,
        {method: 'TRACE',
          params: params,
          headers: headers}),

      options: this.config.withHttpValues(localHttpConfig,
        {method: 'OPTIONS',
          params: params,
          headers: headers}),

      patch: this.config.withHttpValues(localHttpConfig,
        {method: 'PATCH',
          params: params,
          headers: headers})
    });
  };

  /**
   * This is the Path URL creator. It uses Path to show Hierarchy in the Rest API.
   * This means that if you have an Account that then has a set of Buildings, a URL to a building
   * would be /accounts/123/buildings/456
   **/
  var Path = function () {
  };

  Path.prototype = new BaseCreator();

  Path.prototype.base = function (current) {
    var __this = this;
    return  _.reduce(this.parentsArray(current), function (acum, elem) {
      var elemUrl;
      var elemSelfLink = __this.config.getUrlFromElem(elem);
      if (elemSelfLink) {
        if (__this.config.isAbsoluteUrl(elemSelfLink)) {
          return elemSelfLink;
        } else {
          elemUrl = elemSelfLink;
        }
      } else {
        elemUrl = elem[__this.config.restangularFields.route];

        if (elem[__this.config.restangularFields.restangularCollection]) {
          var ids = elem[__this.config.restangularFields.ids];
          if (ids) {
            elemUrl += '/' + ids.join(',');
          }
        } else {
          var elemId;
          if (__this.config.useCannonicalId) {
            elemId = __this.config.getCannonicalIdFromElem(elem);
          } else {
            elemId = __this.config.getIdFromElem(elem);
          }

          if (config.isValidId(elemId) && !elem.singleOne) {
            elemUrl += '/' + (__this.config.encodeIds ? encodeURIComponent(elemId) : elemId);
          }
        }
      }

      return acum.replace(/\/$/, '') + '/' + elemUrl;

    }, this.config.baseUrl);
  };


  Path.prototype.fetchUrl = function (current, what) {
    var baseUrl = this.base(current);
    if (what) {
      baseUrl += '/' + what;
    }
    return baseUrl;
  };

  Path.prototype.fetchRequestedUrl = function (current, what) {
    var url = this.fetchUrl(current, what);
    var params = current[config.restangularFields.reqParams];

    // From here on and until the end of fetchRequestedUrl,
    // the code has been kindly borrowed from angular.js
    // The reason for such code bloating is coherence:
    //   If the user were to use this for cache management, the
    //   serialization of parameters would need to be identical
    //   to the one done by angular for cache keys to match.
    function sortedKeys(obj) {
      var keys = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys.sort();
    }

    function forEachSorted(obj, iterator, context) {
      var keys = sortedKeys(obj);
      for (var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
      }
      return keys;
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    if (!params) {
      return url;
    }

    var parts = [];
    forEachSorted(params, function (value, key) {
      if (value === null || value === undefined) {
        return;
      }
      if (!angular.isArray(value)) {
        value = [value];
      }

      angular.forEach(value, function (v) {
        if (angular.isObject(v)) {
          v = angular.toJson(v);
        }
        parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(v));
      });
    });

    return url + (this.config.suffix || '') + ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&');
  };

  config.urlCreatorFactory.path = Path;
};
