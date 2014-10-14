/**
 * Base URL Creator. Base prototype for everything related to it
 **/

var BaseCreator = function () {
};

BaseCreator.prototype.setConfig = function (config) {
  this.config = config;
  this.elemService = new ElemService(config);
  this.urlService = new UrlService(config);
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

/// FIXME: Make this part of the Prototype ionstead of a separated and weird function
function RestangularResource(config, $http, url, configurer, urlService) {
  var resource = {};
  var __this = this;
  _.each(_.keys(configurer), function (key) {
    var value = configurer[key];

    // Add default parameters
    value.params = _.extend({}, value.params, config.defaultRequestParams[value.method.toLowerCase()]);
    // We don't want the ? if no params are there
    if (_.isEmpty(value.params)) {
      delete value.params;
    }

    // XXX: This doesn't work. Will fix when moved to prototype
    if (urlService.isSafe(value.method)) {

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
    if (!this.urlService.isSafe(operation)) {
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
    url.indexOf(this.config.suffix, url.length - this.config.suffix.length) === -1 && !this.elemService.getUrlFromElem(current)) {
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
  },this.urlService);
};


// TODO what's the difference between operation and method?
// It's called method in fetchListn and callOperation in elemFunction.
// Also, there is a httpMethod, that is configured on Resource
// My guess:
// Is the same, but method can be jsonp for getList and get.
/**
 * Perfoms a request based on all the give parameters.
 *
 * @param current {RestangularBase}
 * @param $http {$http}
 * @param localHttpConfig {object}
 * @param callHeaders {object}
 * @param callParams {object}
 * @param what {string}
 * @param etag {string}
 * @param operation {string}
 * @param method {string}
 * @returns {Promise}
 */
BaseCreator.prototype.makeRequest = function (current, $http, localHttpConfig, callHeaders, callParams, what, etag, operation) {
  var config = this.config;

  function computeParameters(current, methodDefault, commonDefault) {
    // Aca un cambio, dado que hoy por hoy, method pisa a common y a current (pero no deberia)
    return _.defaults(current, methodDefault, commonDefault);
  }

  function computeHeaders(current, commonDefault, currentEtag, isSafeOperation) {
    var headers = _.defaults(callHeaders || {}, config.defaultHeaders);

    if (currentEtag) {
      if (!isSafeOperation) {
        headers['If-Match'] = currentEtag;
      } else {
        headers['If-None-Match'] = currentEtag;
      }
    }

    return headers;
  }

  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) === -1;
  }

  function computeUrl(baseElementPath, requestExtraPath, configuredSuffix) {
    var url = baseElementPath;

    if (requestExtraPath) {
      var add = '';
      if (!/\/$/.test(url)) {
        add += '/';
      }
      add += requestExtraPath;
      url += add;
    }

    if (configuredSuffix && endsWith(url, configuredSuffix)) {
      url += configuredSuffix;
    }

    return url;
  }

  function mapOperationToMethod(operation) {
    if (operation === 'getList') {
      return 'get';
    } else if (operation === 'remove') {
      return 'delete';
    } else {
      return operation.toLowerCase();
    }
  }

  function applyJsonpIfnecessary(method, withJsonp) {
    if (withJsonp && method === 'get') {
      return 'jsonp';
    } else {
      return method;
    }

  }

  function isSafeOperation(operation) {
    return _.contains(['get', 'head', 'options', 'trace', 'getlist'], operation.toLowerCase());
  };

  var httpConfig = {}

  httpConfig.method = applyJsonpIfnecessary(mapOperationToMethod(operation), config.jsonp);

  httpConfig.params = computeParameters(callParams || {}, config.defaultRequestParams[httpConfig.method], config.defaultRequestParams.common);

  httpConfig.headers = computeHeaders(callHeaders || {}, config.defaultHeaders, etag, isSafeOperation(operation));

  var suffix = this.elemService.getUrlFromElem(current) ? null : config.suffix;
  httpConfig.url = computeUrl(this.base(current), what, suffix);


  // XXX this replaces config.withHttpValues()
  var resultHttpConfig = _.defaults(httpConfig, localHttpConfig, config.defaultHttpFields);

  // TODO is this necessary??
  // We don't want the ? if no params are there
  if (_.isEmpty(resultHttpConfig.params)) {
    delete resultHttpConfig.params;
  }

  // XXX this seems to have a race condition problem.
  current[config.restangularFields.httpConfig] = undefined;

  // TODO ojo q operation y method son cosas distintas!

  return $http(resultHttpConfig);
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
    var elemSelfLink = __this.elemService.getUrlFromElem(elem);
    if (elemSelfLink) {
      if (__this.urlService.isAbsoluteUrl(elemSelfLink)) {
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
          elemId = __this.elemService.getCannonicalIdFromElem(elem);
        } else {
          elemId = __this.elemService.getIdFromElem(elem);
        }

        if (__this.elemService.isValidId(elemId) && !elem.singleOne) {
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



