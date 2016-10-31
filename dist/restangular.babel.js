/**
 * Restful Resources service for AngularJS apps
 * @version v1.5.2 - 2016-10-31 * @link https://github.com/mgonto/restangular
 * @author Martin Gontovnikas <martin@gon.to>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (factory) {
  // https://github.com/umdjs/umd/blob/master/templates/returnExports.js
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('angular'));
  } else {
    // No global export, Restangular will register itself as Angular.js module
    factory(angular);
  }
}(function (angular) {
  const restangular = angular.module('restangular', []);

  restangular.provider('Restangular', function () {
    // Configuration
    const Configurer = {};
    Configurer.init = (object, config) => {
      object.configuration = config;

      /**
       * Those are HTTP safe methods for which there is no need to pass any data with the request.
       */
      const safeMethods = ['get', 'head', 'options', 'trace', 'getlist'];
      config.isSafe = operation => safeMethods.includes(operation.toLowerCase());

      const absolutePattern = /^https?:\/\//i;
      config.isAbsoluteUrl = string => !angular.isDefined(config.absoluteUrl) || config.absoluteUrl === null ?
        string && absolutePattern.test(string) : config.absoluteUrl;

      config.absoluteUrl = !angular.isDefined(config.absoluteUrl) || config.absoluteUrl;
      object.setSelfLinkAbsoluteUrl = value => config.absoluteUrl = value;
      /**
       * This is the BaseURL to be used with Restangular
       */
      config.baseUrl = !angular.isDefined(config.baseUrl) ? '' : config.baseUrl;
      object.setBaseUrl = function (newBaseUrl) {
        config.baseUrl = /\/$/.test(newBaseUrl) ? newBaseUrl.substring(0, newBaseUrl.length - 1) : newBaseUrl;
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

      /**
       * Always return plain data, no restangularized object
      **/
      config.plainByDefault = config.plainByDefault || false;
      object.setPlainByDefault = function (value) {
        config.plainByDefault = value === true ? true : false;
        return this;
      }

      config.withHttpValues = (httpLocalConfig, obj) => angular.extend(obj, httpLocalConfig, config.defaultHttpFields);

      config.encodeIds = !angular.isDefined(config.encodeIds) ? true : config.encodeIds;
      object.setEncodeIds = encode => config.encodeIds = encode;

      config.defaultRequestParams = config.defaultRequestParams || {
        get: {},
        post: {},
        put: {},
        remove: {},
        common: {}
      };

      object.setDefaultRequestParams = function (param1, param2) {
        let methods = [];
        const params = param2 || param1;
        if (angular.isDefined(param2)) {
          if (angular.isArray(param1)) {
            methods = param1;
          } else {
            methods.push(param1);
          }
        } else {
          methods.push('common');
        }

        angular.forEach(methods, method => config.defaultRequestParams[method] = params);
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
        const overriders = angular.extend([], values);
        if (config.isOverridenMethod('delete', overriders)) {
          overriders.push('remove');
        }
        config.methodOverriders = overriders;
        return this;
      };

      config.jsonp = !angular.isDefined(config.jsonp) ? false : config.jsonp;
      object.setJsonp = active => config.jsonp = active;

      config.isOverridenMethod = (method, values) => {
        const search = values || config.methodOverriders;
        return !!angular.isDefined(search.find(one => one.toLowerCase() === method.toLowerCase()));
      };

      /**
       * Sets the URL creator type. For now, only Path is created. In the future we'll have queryParams
      **/
      config.urlCreator = config.urlCreator || 'path';
      object.setUrlCreator = function (name) {
        if (!config.urlCreatorFactory.hasOwnProperty(name)) {
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
        get: 'get',
        getList: 'getList',
        put: 'put',
        post: 'post',
        remove: 'remove',
        head: 'head',
        trace: 'trace',
        options: 'options',
        patch: 'patch',
        getRestangularUrl: 'getRestangularUrl',
        getRequestedUrl: 'getRequestedUrl',
        putElement: 'putElement',
        addRestangularMethod: 'addRestangularMethod',
        getParentList: 'getParentList',
        clone: 'clone',
        ids: 'ids',
        httpConfig: '_$httpConfig',
        reqParams: 'reqParams',
        one: 'one',
        all: 'all',
        several: 'several',
        oneUrl: 'oneUrl',
        allUrl: 'allUrl',
        customPUT: 'customPUT',
        customPATCH: 'customPATCH',
        customPOST: 'customPOST',
        customDELETE: 'customDELETE',
        customGET: 'customGET',
        customGETLIST: 'customGETLIST',
        customOperation: 'customOperation',
        doPUT: 'doPUT',
        doPATCH: 'doPATCH',
        doPOST: 'doPOST',
        doDELETE: 'doDELETE',
        doGET: 'doGET',
        doGETLIST: 'doGETLIST',
        fromServer: 'fromServer',
        withConfig: 'withConfig',
        withHttpConfig: 'withHttpConfig',
        singleOne: 'singleOne',
        plain: 'plain',
        save: 'save',
        restangularized: 'restangularized'
      };
      object.setRestangularFields = function (resFields) {
        config.restangularFields = angular.extend(config.restangularFields, resFields);
        return this;
      };

      config.isRestangularized = obj => !!obj[config.restangularFields.restangularized];

      config.setFieldToElem = function (field, elem, value) {
        const properties = field.split('.');
        let idValue = elem;
        angular.forEach(properties.slice(0, properties.length - 1), prop => {
          idValue[prop] = {};
          idValue = idValue[prop];
        });
        idValue[properties.slice(properties.length - 1)] = value;
        return this;
      };

      config.getFieldFromElem = (field, elem) => {
        const properties = field.split('.');
        let idValue = elem;
        angular.forEach(properties, prop => idValue && (idValue = idValue[prop]));
        return angular.copy(idValue);
      };

      config.setIdToElem = function (elem, id) {
        config.setFieldToElem(config.restangularFields.id, elem, id);
        return this;
      };

      config.getIdFromElem = elem => config.getFieldFromElem(config.restangularFields.id, elem);

      config.isValidId = elemId => '' !== elemId && !!angular.isDefined(elemId) && !(elemId === null);

      config.setUrlToElem = function (elem, url) {
        config.setFieldToElem(config.restangularFields.selfLink, elem, url);
        return this;
      };

      config.getUrlFromElem = elem => config.getFieldFromElem(config.restangularFields.selfLink, elem);

      config.useCannonicalId = !angular.isDefined(config.useCannonicalId) ? false : config.useCannonicalId;
      object.setUseCannonicalId = function (value) {
        config.useCannonicalId = value;
        return this;
      };

      config.getCannonicalIdFromElem = elem => {
        const cannonicalId = elem[config.restangularFields.cannonicalId];
        const actualId = config.isValidId(cannonicalId) ? cannonicalId : config.getIdFromElem(elem);
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

      config.defaultResponseInterceptor = data => data;

      config.responseExtractor = (data, operation, what, url, response, deferred) => {
        const interceptors = angular.copy(config.responseInterceptors);
        interceptors.push(config.defaultResponseInterceptor);
        let theData = data;
        angular.forEach(interceptors, interceptor => theData = interceptor(theData, operation, what, url, response, deferred));
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

      config.defaultInterceptor = (element, operation, path, url, headers, params, httpConfig) => ({
        element,
        headers,
        params,
        httpConfig
      });

      config.fullRequestInterceptor = (element, operation, path, url, headers, params, httpConfig) => {
        const interceptors = angular.copy(config.requestInterceptors);
        const defaultRequest = config.defaultInterceptor(element, operation, path, url, headers, params, httpConfig);
        return interceptors.reduce((request, interceptor) => angular.extend(request, interceptor(request.element, operation,
          path, url, request.headers, request.params, request.httpConfig)), defaultRequest);
      };

      object.addRequestInterceptor = function (interceptor) {
        config.requestInterceptors.push((elem, operation, path, url, headers, params, httpConfig) => ({
          headers,
          params,
          element: interceptor(elem, operation, path, url),
          httpConfig
        }));
        return this;
      };

      object.setRequestInterceptor = object.addRequestInterceptor;

      object.addFullRequestInterceptor = function (interceptor) {
        config.requestInterceptors.push(interceptor);
        return this;
      };

      object.setFullRequestInterceptor = object.addFullRequestInterceptor;

      config.onBeforeElemRestangularized = config.onBeforeElemRestangularized || (elem => elem);
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
      config.onElemRestangularized = config.onElemRestangularized || (elem => elem);
      object.setOnElemRestangularized = function (post) {
        config.onElemRestangularized = post;
        return this;
      };

      config.shouldSaveParent = config.shouldSaveParent || (() => true);
      object.setParentless = function (values) {
        if (angular.isArray(values)) {
          config.shouldSaveParent = route => !values.includes(route);
        } else if (typeof values === 'boolean') {
          config.shouldSaveParent = () => !values;
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
      config.suffix = !angular.isDefined(config.suffix) ? null : config.suffix;
      object.setRequestSuffix = function (newSuffix) {
        config.suffix = newSuffix;
        return this;
      };

      /**
       * Add element transformers for certain routes.
       */
      config.transformers = config.transformers || {};
      object.addElementTransformer = function (type, secondArg, thirdArg) {
        let isCollection = null;
        let transformer = null;
        if (arguments.length === 2) {
          transformer = secondArg;
        } else {
          transformer = thirdArg;
          isCollection = secondArg;
        }

        let typeTransformers = config.transformers[type];
        if (!typeTransformers) {
          typeTransformers = config.transformers[type] = [];
        }

        typeTransformers.push((coll, elem) => (isCollection === null || (coll === isCollection)) ? transformer(elem) : elem);

        return object;
      };

      object.extendCollection = (route, fn) => object.addElementTransformer(route, true, fn);

      object.extendModel = (route, fn) => object.addElementTransformer(route, false, fn);

      config.transformElem = (elem, isCollection, route, Restangular, force) => {
        if (!force && !config.transformLocalElements && !elem[config.restangularFields.fromServer]) {
          return elem;
        }
        const typeTransformers = config.transformers[route];
        let changedElem = elem;
        if (typeTransformers) {
          angular.forEach(typeTransformers, transformer => changedElem = transformer(isCollection, changedElem));
        }
        return config.onElemRestangularized(changedElem, isCollection, route, Restangular);
      };

      config.transformLocalElements = !angular.isDefined(config.transformLocalElements) ?
        false : config.transformLocalElements;

      object.setTransformOnlyServerElements = active => config.transformLocalElements = !active;

      config.fullResponse = !angular.isDefined(config.fullResponse) ? false : config.fullResponse;
      object.setFullResponse = function (full) {
        config.fullResponse = full;
        return this;
      };


      // Internal values and functions
      config.urlCreatorFactory = {};

      /**
       * Base URL Creator. Base prototype for everything related to it
       **/

      class BaseCreator {
        setConfig(cfg) {
          this.config = cfg;
          return this;
        }

        parentsArray(current) {
          const parents = [];
          while (current) {
            parents.push(current);
            current = current[this.config.restangularFields.parentResource];
          }
          return parents.reverse();
        }

        resource(
          current,
          $http,
          localHttpConfig,
          callHeaders,
          callParams,
          what,
          etag,
          operation) {
          const params = angular.extend(callParams || {}, this.config.defaultRequestParams.common);
          const headers = angular.extend(callHeaders || {}, this.config.defaultHeaders);

          if (etag) {
            if (!config.isSafe(operation)) {
              headers['If-Match'] = etag;
            } else {
              headers['If-None-Match'] = etag;
            }
          }

          let url = this.base(current);

          if (what) {
            let add = '';
            if (!/\/$/.test(url)) {
              add += '/';
            }
            add += what;
            url += add;
          }

          if (this.config.suffix &&
            url.indexOf(this.config.suffix, url.length - this.config.suffix.length) === -1 &&
            !this.config.getUrlFromElem(current)) {
            url += this.config.suffix;
          }

          current[this.config.restangularFields.httpConfig] = void 0;

          return RestangularResource(this.config, $http, url, {
            getList: this.config.withHttpValues(localHttpConfig,
              {
                method: 'GET',
                params,
                headers
              }),

            get: this.config.withHttpValues(localHttpConfig,
              {
                method: 'GET',
                params,
                headers
              }),

            jsonp: this.config.withHttpValues(localHttpConfig,
              {
                method: 'jsonp',
                params,
                headers
              }),

            put: this.config.withHttpValues(localHttpConfig,
              {
                method: 'PUT',
                params,
                headers
              }),

            post: this.config.withHttpValues(localHttpConfig,
              {
                method: 'POST',
                params,
                headers
              }),

            remove: this.config.withHttpValues(localHttpConfig,
              {
                method: 'DELETE',
                params,
                headers
              }),

            head: this.config.withHttpValues(localHttpConfig,
              {
                method: 'HEAD',
                params,
                headers
              }),

            trace: this.config.withHttpValues(localHttpConfig,
              {
                method: 'TRACE',
                params,
                headers
              }),

            options: this.config.withHttpValues(localHttpConfig,
              {
                method: 'OPTIONS',
                params,
                headers
              }),

            patch: this.config.withHttpValues(localHttpConfig,
              {
                method: 'PATCH',
                params,
                headers
              })
          });
        }
      }

      function RestangularResource(localConfig, $http, url, configurer) {
        const resource = {};
        angular.forEach(Object.keys(configurer), key => {
          const value = configurer[key];

          // Add default parameters
          value.params = angular.extend({}, value.params, localConfig.defaultRequestParams[value.method.toLowerCase()]);
          // We don't want the ? if no params are there
          if (!value.params || !(angular.isObject(value.params)) || !(angular.isArray(value.params) ? value.params : Object.keys(value.params)).length) {
            delete value.params;
          }

          if (localConfig.isSafe(value.method)) {
            resource[key] = () => $http(angular.extend(value, { url }));
          } else {
            resource[key] = data => $http(angular.extend(value, { url, data }));
          }
        });

        return resource;
      }

      /**
       * This is the Path URL creator. It uses Path to show Hierarchy in the Rest API.
       * This means that if you have an Account that then has a set of Buildings, a URL to a building
       * would be /accounts/123/buildings/456
      **/
      class Path extends BaseCreator {
        normalizeUrl(url) {
          const parts = /((?:http[s]?:)?\/\/)?(.*)?/.exec(url);
          parts[2] = parts[2].replace(/[\\\/]+/g, '/');
          return (typeof parts[1] !== 'undefined') ? parts[1] + parts[2] : parts[2];
        }

        base(current) {
          const __this = this;
          return this.parentsArray(current).reduce((acum, elem) => {
            let elemUrl;
            const elemSelfLink = __this.config.getUrlFromElem(elem);
            if (elemSelfLink) {
              if (__this.config.isAbsoluteUrl(elemSelfLink)) {
                return elemSelfLink;
              }
              elemUrl = elemSelfLink;
            } else {
              elemUrl = elem[__this.config.restangularFields.route];

              if (elem[__this.config.restangularFields.restangularCollection]) {
                const ids = elem[__this.config.restangularFields.ids];
                if (ids) {
                  elemUrl += `/${ids.join(',')}`;
                }
              } else {
                let elemId;
                if (__this.config.useCannonicalId) {
                  elemId = __this.config.getCannonicalIdFromElem(elem);
                } else {
                  elemId = __this.config.getIdFromElem(elem);
                }

                if (config.isValidId(elemId) && !elem.singleOne) {
                  elemUrl += `/${__this.config.encodeIds ? encodeURIComponent(elemId) : elemId}`;
                }
              }
            }
            acum = `${acum.replace(/\/$/, '')}/${elemUrl}`;
            return __this.normalizeUrl(acum);
          }, this.config.baseUrl);
        }

        fetchUrl(current, what) {
          let baseUrl = this.base(current);
          if (what) {
            baseUrl += `/${what}`;
          }
          return baseUrl;
        }

        fetchRequestedUrl(current, what) {
          const url = this.fetchUrl(current, what);
          const params = current[config.restangularFields.reqParams];

          // From here on and until the end of fetchRequestedUrl,
          // the code has been kindly borrowed from angular.js
          // The reason for such code bloating is coherence:
          //   If the user were to use this for cache management, the
          //   serialization of parameters would need to be identical
          //   to the one done by angular for cache keys to match.
          function sortedKeys(obj) {
            const keys = [];
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                keys.push(key);
              }
            }
            return keys.sort();
          }

          function forEachSorted(obj, iterator, context) {
            const keys = sortedKeys(obj);
            for (let i = 0; i < keys.length; i++) {
              iterator.call(context, obj[keys[i]], keys[i]);
            }
            return keys;
          }

          function encodeUriQuery(val, pctEncodeSpaces) {
            return encodeURIComponent(val)
              .replace(/%40/gi, '@')
              .replace(/%3A/gi, ':')
              .replace(/%24/g, '$')
              .replace(/%2C/gi, ',')
              .replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
          }

          if (!params) { return url + (this.config.suffix || ''); }

          const parts = [];
          forEachSorted(params, (value, key) => {
            if (value === null || value === void 0) { return; }
            if (!angular.isArray(value)) { value = [value]; }

            angular.forEach(value, v => {
              if (angular.isObject(v)) {
                v = angular.toJson(v);
              }
              parts.push(`${encodeUriQuery(key)}=${encodeUriQuery(v)}`);
            });
          });

          return url + (this.config.suffix || '') + ((!url.includes('?')) ? '?' : '&') + parts.join('&');
        }
      }
      config.urlCreatorFactory.path = Path;
    };

    const globalConfiguration = {};

    Configurer.init(this, globalConfiguration);


    this.$get = ['$http', '$q', ($http, $q) => {
      function createServiceForConfiguration(config) {
        const service = {};

        const urlHandler = new config.urlCreatorFactory[config.urlCreator]();
        urlHandler.setConfig(config);

        function restangularizeBase(parent, elem, route, reqParams, fromServer) {
          elem[config.restangularFields.route] = route;
          elem[config.restangularFields.getRestangularUrl] = urlHandler.fetchUrl.bind(urlHandler, elem);
          elem[config.restangularFields.getRequestedUrl] = urlHandler.fetchRequestedUrl.bind(urlHandler, elem);
          elem[config.restangularFields.addRestangularMethod] = addRestangularMethodFunction.bind(elem);
          elem[config.restangularFields.clone] = copyRestangularizedElement.bind(elem, elem);
          elem[config.restangularFields.reqParams] = (!reqParams || !(angular.isObject(reqParams)) ||
            !(angular.isArray(reqParams) ? reqParams : Object.keys(reqParams)).length) ? null : reqParams;
          elem[config.restangularFields.withHttpConfig] = withHttpConfig.bind(elem);
          elem[config.restangularFields.plain] = stripRestangular.bind(elem, elem);

          // Tag element as restangularized
          elem[config.restangularFields.restangularized] = true;

          // RequestLess connection
          elem[config.restangularFields.one] = one.bind(elem, elem);
          elem[config.restangularFields.all] = all.bind(elem, elem);
          elem[config.restangularFields.several] = several.bind(elem, elem);
          elem[config.restangularFields.oneUrl] = oneUrl.bind(elem, elem);
          elem[config.restangularFields.allUrl] = allUrl.bind(elem, elem);

          elem[config.restangularFields.fromServer] = !!fromServer;

          if (parent && config.shouldSaveParent(route)) {
            const parentId = config.getIdFromElem(parent);
            const parentUrl = config.getUrlFromElem(parent);
            const pickedFields = [];
            ['route', 'singleOne', 'parentResource'].forEach(field => {
              if (config.restangularFields.hasOwnProperty(field)) {
                pickedFields.push(config.restangularFields[field]);
              }
            });

            const restangularFieldsForParent = new Set([...pickedFields, ...config.extraFields]);
            const parentResource = {};
            restangularFieldsForParent.forEach(field => {
              if (parent.hasOwnProperty(field)) {
                parentResource[field] = parent[field];
              }
            });

            if (config.isValidId(parentId)) {
              config.setIdToElem(parentResource, parentId, route);
            }
            if (config.isValidId(parentUrl)) {
              config.setUrlToElem(parentResource, parentUrl, route);
            }

            elem[config.restangularFields.parentResource] = parentResource;
          } else {
            elem[config.restangularFields.parentResource] = null;
          }
          return elem;
        }

        function one(parent, route, id, singleOne) {
          let error;
          if (angular.isNumber(route) || angular.isNumber(parent)) {
            error = 'You\'re creating a Restangular entity with the number ';
            error += 'instead of the route or the parent. For example, you can\'t call .one(12).';
            throw new Error(error);
          }
          if (!angular.isDefined(route)) {
            error = 'You\'re creating a Restangular entity either without the path. ';
            error += 'For example you can\'t call .one(). Please check if your arguments are valid.';
            throw new Error(error);
          }
          const elem = {};
          config.setIdToElem(elem, id, route);
          config.setFieldToElem(config.restangularFields.singleOne, elem, singleOne);
          return restangularizeElem(parent, elem, route, false);
        }


        function all(parent, route) {
          return restangularizeCollection(parent, [], route, false);
        }

        function several(parent, route) {
          const collection = [];
          collection[config.restangularFields.ids] = Array.prototype.splice.call(arguments, 2);
          return restangularizeCollection(parent, collection, route, false);
        }

        function oneUrl(parent, route, url) {
          if (!route) {
            throw new Error('Route is mandatory when creating new Restangular objects.');
          }
          const elem = {};
          config.setUrlToElem(elem, url, route);
          return restangularizeElem(parent, elem, route, false);
        }


        function allUrl(parent, route, url) {
          if (!route) {
            throw new Error('Route is mandatory when creating new Restangular objects.');
          }
          const elem = {};
          config.setUrlToElem(elem, url, route);
          return restangularizeCollection(parent, elem, route, false);
        }
        // Promises
        function restangularizePromise(promise, isCollection, valueToFill) {
          promise.call = promiseCall.bind(promise);
          promise.get = promiseGet.bind(promise);
          promise[config.restangularFields.restangularCollection] = isCollection;
          if (isCollection) {
            promise.push = promiseCall.bind(promise, 'push');
          }
          promise.$object = valueToFill;
          if (config.restangularizePromiseInterceptor) {
            config.restangularizePromiseInterceptor(promise);
          }
          return promise;
        }

        function promiseCall(method) {
          const deferred = $q.defer();
          const callArgs = arguments;
          let filledValue = {};
          this.then(val => {
            const params = Array.prototype.slice.call(callArgs, 1);
            const func = val[method];
            func.apply(val, params);
            filledValue = val;
            deferred.resolve(val);
          });
          return restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection], filledValue);
        }

        function promiseGet(what) {
          const deferred = $q.defer();
          let filledValue = {};
          this.then(val => {
            filledValue = val[what];
            deferred.resolve(filledValue);
          });
          return restangularizePromise(deferred.promise, this[config.restangularFields.restangularCollection], filledValue);
        }

        function resolvePromise(deferred, response, data, filledValue) {
          angular.extend(filledValue, data);

          // Trigger the full response interceptor.
          if (config.fullResponse) {
            return deferred.resolve(angular.extend(response, { data }));
          }
          deferred.resolve(data);
        }


        // Elements
        function stripRestangular(elem) {
          if (angular.isArray(elem)) {
            const array = [];
            angular.forEach(elem, value => array.push(config.isRestangularized(value) ? stripRestangular(value) : value));
            return array;
          }
          const newElem = angular.copy(elem);
          Object.keys(config.restangularFields).forEach(key => key !== 'id' && delete newElem[config.restangularFields[key]]);

          return newElem;
        }

        function addCustomOperation(elem) {
          elem[config.restangularFields.customOperation] = customFunction.bind(elem);

          var requestMethods = { get: customFunction, delete: customFunction };
          angular.forEach(['put', 'patch', 'post'], function (name) {
            requestMethods[name] = function (operation, elem, path, params, headers) {
              return customFunction.bind(this)(operation, path, params, headers, elem);
            };
          });
          angular.forEach(requestMethods, (requestFunc, name) => {
            var callOperation = name === 'delete' ? 'remove' : name;
            angular.forEach(['do', 'custom'], alias => elem[alias + name.toUpperCase()] = requestFunc.bind(elem, callOperation));
          });
          elem[config.restangularFields.customGETLIST] = fetchFunction.bind(elem);
          elem[config.restangularFields.doGETLIST] = elem[config.restangularFields.customGETLIST];
        }

        function copyRestangularizedElement(fromElement, toElement) {
          const copiedElement = angular.copy(fromElement, toElement);
          return restangularizeElem(copiedElement[config.restangularFields.parentResource],
            copiedElement, copiedElement[config.restangularFields.route], true);
        }

        function restangularizeElem(parent, element, route, fromServer, collection, reqParams) {
          const elem = config.onBeforeElemRestangularized(element, false, route);

          const localElem = restangularizeBase(parent, elem, route, reqParams, fromServer);

          if (config.useCannonicalId) {
            localElem[config.restangularFields.cannonicalId] = config.getIdFromElem(localElem);
          }

          if (collection) {
            localElem[config.restangularFields.getParentList] = () => collection;
          }

          localElem[config.restangularFields.restangularCollection] = false;
          localElem[config.restangularFields.get] = getFunction.bind(localElem);
          localElem[config.restangularFields.getList] = fetchFunction.bind(localElem);
          localElem[config.restangularFields.put] = putFunction.bind(localElem);
          localElem[config.restangularFields.post] = postFunction.bind(localElem);
          localElem[config.restangularFields.remove] = deleteFunction.bind(localElem);
          localElem[config.restangularFields.head] = headFunction.bind(localElem);
          localElem[config.restangularFields.trace] = traceFunction.bind(localElem);
          localElem[config.restangularFields.options] = optionsFunction.bind(localElem);
          localElem[config.restangularFields.patch] = patchFunction.bind(localElem);
          localElem[config.restangularFields.save] = save.bind(localElem);

          addCustomOperation(localElem);
          return config.transformElem(localElem, false, route, service, true);
        }

        function restangularizeCollection(parent, element, route, fromServer, reqParams) {
          const elem = config.onBeforeElemRestangularized(element, true, route);

          const localElem = restangularizeBase(parent, elem, route, reqParams, fromServer);
          localElem[config.restangularFields.restangularCollection] = true;
          localElem[config.restangularFields.post] = postFunction.bind(localElem, null);
          localElem[config.restangularFields.remove] = deleteFunction.bind(localElem);
          localElem[config.restangularFields.head] = headFunction.bind(localElem);
          localElem[config.restangularFields.trace] = traceFunction.bind(localElem);
          localElem[config.restangularFields.putElement] = putElementFunction.bind(localElem);
          localElem[config.restangularFields.options] = optionsFunction.bind(localElem);
          localElem[config.restangularFields.patch] = patchFunction.bind(localElem);
          localElem[config.restangularFields.get] = getById.bind(localElem);
          localElem[config.restangularFields.getList] = fetchFunction.bind(localElem, null);

          addCustomOperation(localElem);
          return config.transformElem(localElem, true, route, service, true);
        }

        function restangularizeCollectionAndElements(parent, element, route) {
          const collection = restangularizeCollection(parent, element, route, false);
          angular.forEach(collection, elem => elem && restangularizeElem(parent, elem, route, false));
          return collection;
        }

        function getById(id, reqParams, headers) {
          return this.customGET(id.toString(), reqParams, headers);
        }

        function putElementFunction(idx, params, headers) {
          const __this = this;
          const elemToPut = this[idx];
          const deferred = $q.defer();
          let filledArray = [];
          filledArray = config.transformElem(filledArray, true, elemToPut[config.restangularFields.route], service);
          elemToPut.put(params, headers).then(serverElem => {
            const newArray = copyRestangularizedElement(__this);
            newArray[idx] = serverElem;
            filledArray = newArray;
            deferred.resolve(newArray);
          }, response => {
            deferred.reject(response);
          });

          return restangularizePromise(deferred.promise, true, filledArray);
        }

        function parseResponse(resData, operation, route, fetchUrl, response, deferred) {
          const data = config.responseExtractor(resData, operation, route, fetchUrl, response, deferred);
          const etag = response.headers('ETag');
          if (data && etag) {
            data[config.restangularFields.etag] = etag;
          }
          return data;
        }


        function fetchFunction(what, reqParams, headers) {
          const __this = this;
          const deferred = $q.defer();
          const operation = 'getList';
          const url = urlHandler.fetchUrl(this, what);
          const whatFetched = what || __this[config.restangularFields.route];

          const request = config.fullRequestInterceptor(null, operation,
            whatFetched, url, headers || {}, reqParams || {}, this[config.restangularFields.httpConfig] || {});

          let filledArray = [];
          filledArray = config.transformElem(filledArray, true, whatFetched, service);

          let method = 'getList';

          if (config.jsonp) {
            method = 'jsonp';
          }

          const okCallback = response => {
            const resData = response.data;
            const fullParams = response.config.params;
            let data = parseResponse(resData, operation, whatFetched, url, response, deferred);

            // support empty response for getList() calls (some APIs respond with 204 and empty body)
            if (!angular.isDefined(data) || '' === data) {
              data = [];
            }
            if (!angular.isArray(data)) {
              throw new Error('Response for getList SHOULD be an array and not an object or something else');
            }
            if (true === config.plainByDefault) {
              return resolvePromise(deferred, response, data, filledArray);
            }
            let processedData = data.map(elem => {
              if (!__this[config.restangularFields.restangularCollection]) {
                return restangularizeElem(__this, elem, what, true, data);
              }
              return restangularizeElem(__this[config.restangularFields.parentResource],
                elem, __this[config.restangularFields.route], true, data);
            });

            processedData = angular.extend(data, processedData);

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
              } else if (config.errorInterceptors.every(cb => cb(response, deferred, okCallback) !== false)) {
                // triggered if no callback returns false
                deferred.reject(response);
              }
            });

          return restangularizePromise(deferred.promise, true, filledArray);
        }

        function withHttpConfig(httpConfig) {
          this[config.restangularFields.httpConfig] = httpConfig;
          return this;
        }

        function save(params, headers) {
          if (this[config.restangularFields.fromServer]) {
            return this[config.restangularFields.put](params, headers);
          }
          return elemFunction.bind(this)('post', void 0, params, void 0, headers);
        }

        function elemFunction(operation, what, params, obj, headers) {
          const __this = this;
          const deferred = $q.defer();
          const resParams = params || {};
          const route = what || this[config.restangularFields.route];
          const fetchUrl = urlHandler.fetchUrl(this, what);

          let callObj = obj || this;
          // fallback to etag on restangular object (since for custom methods we probably don't explicitly specify the etag field)
          const etag = callObj[config.restangularFields.etag] || (operation !== 'post' ? this[config.restangularFields.etag] : null);

          if (angular.isObject(callObj) && config.isRestangularized(callObj)) {
            callObj = stripRestangular(callObj);
          }
          const request = config.fullRequestInterceptor(callObj, operation, route, fetchUrl,
            headers || {}, resParams || {}, this[config.restangularFields.httpConfig] || {});

          let filledObject = {};
          filledObject = config.transformElem(filledObject, false, route, service);

          const okCallback = response => {
            const resData = response.data;
            const fullParams = response.config.params;
            const elem = parseResponse(resData, operation, route, fetchUrl, response, deferred);
            if (elem) {
              let data;
              if (true === config.plainByDefault) {
                return resolvePromise(deferred, response, elem, filledObject);
              }
              if (operation === 'post' && !__this[config.restangularFields.restangularCollection]) {
                data = restangularizeElem(
                  __this[config.restangularFields.parentResource],
                  elem,
                  route,
                  true,
                  null,
                  fullParams
                );
                resolvePromise(deferred, response, data, filledObject);
              } else {
                data = restangularizeElem(
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
              resolvePromise(deferred, response, void 0, filledObject);
            }
          };

          const errorCallback = response => {
            if (response.status === 304 && config.isSafe(operation)) {
              resolvePromise(deferred, response, __this, filledObject);
            } else if (config.errorInterceptors.every(cb => cb(response, deferred, okCallback) !== false)) {
              // triggered if no callback returns false
              deferred.reject(response);
            }
          };
          // Overriding HTTP Method
          let callOperation = operation;
          let callHeaders = angular.extend({}, request.headers);
          const isOverrideOperation = config.isOverridenMethod(operation);
          if (isOverrideOperation) {
            callOperation = 'post';
            callHeaders = angular.extend(callHeaders, { 'X-HTTP-Method-Override': operation === 'remove' ? 'DELETE' : operation.toUpperCase() });
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

          return restangularizePromise(deferred.promise, false, filledObject);
        }

        function getFunction(params, headers) {
          return elemFunction.bind(this)('get', void 0, params, void 0, headers);
        }

        function deleteFunction(params, headers) {
          return elemFunction.bind(this)('remove', void 0, params, void 0, headers);
        }

        function putFunction(params, headers) {
          return elemFunction.bind(this)('put', void 0, params, void 0, headers);
        }

        function postFunction(what, elem, params, headers) {
          return elemFunction.bind(this)('post', what, params, elem, headers);
        }

        function headFunction(params, headers) {
          return elemFunction.bind(this)('head', void 0, params, void 0, headers);
        }

        function traceFunction(params, headers) {
          return elemFunction.bind(this)('trace', void 0, params, void 0, headers);
        }

        function optionsFunction(params, headers) {
          return elemFunction.bind(this)('options', void 0, params, void 0, headers);
        }

        function patchFunction(elem, params, headers) {
          return elemFunction.bind(this)('patch', void 0, params, elem, headers);
        }

        function customFunction(operation, path, params, headers, elem) {
          return elemFunction.bind(this)(operation, path, params, elem, headers);
        }

        function addRestangularMethodFunction(name, operation, path, defaultParams, defaultHeaders, defaultElem) {
          let bindedFunction;
          if (operation === 'getList') {
            bindedFunction = fetchFunction.bind(this, path);
          } else {
            bindedFunction = customFunction.bind(this, operation, path);
          }

          const createdFunction = (params, headers, elem) => {
            const callParams = angular.extend({
              params,
              headers,
              elem
            }, {
                params: defaultParams,
                headers: defaultHeaders,
                elem: defaultElem
              });
            return bindedFunction(callParams.params, callParams.headers, callParams.elem);
          };

          if (config.isSafe(operation)) {
            this[name] = createdFunction;
          } else {
            this[name] = (elem, params, headers) => createdFunction(params, headers, elem);
          }
        }

        function withConfigurationFunction(configurer) {
          const newConfig = angular.copy(config);
          delete newConfig.configuration;

          Configurer.init(newConfig, newConfig);
          configurer(newConfig);
          return createServiceForConfiguration(newConfig);
        }

        function toService(route, parent) {
          const knownCollectionMethods = Object.keys(config.restangularFields).map(key => config.restangularFields[key]);
          const serv = {};
          const collection = (parent || service).all(route);
          serv.one = one.bind((parent || service), parent, route);
          serv.post = collection.post.bind(collection);
          serv.getList = collection.getList.bind(collection);

          for (const prop in collection) {
            if (collection.hasOwnProperty(prop) && typeof collection[prop] === 'function' && !knownCollectionMethods.includes(prop)) {
              serv[prop] = collection[prop].bind(collection);
            }
          }

          return serv;
        }


        Configurer.init(service, config);

        service.copy = copyRestangularizedElement.bind(service);

        service.service = toService.bind(service);

        service.withConfig = withConfigurationFunction.bind(service);

        service.one = one.bind(service, null);

        service.all = all.bind(service, null);

        service.several = several.bind(service, null);

        service.oneUrl = oneUrl.bind(service, null);

        service.allUrl = allUrl.bind(service, null);

        service.stripRestangular = stripRestangular.bind(service);

        service.restangularizeElement = restangularizeElem.bind(service);

        service.restangularizeCollection = restangularizeCollectionAndElements.bind(service);

        return service;
      }

      return createServiceForConfiguration(globalConfiguration);
    }];
  });
  return restangular.name;
}));
