/* jshint jasmine: true */
describe('BaseCreator', function () {

  var Restangular, BaseCreator, bc, $http, $httpBackend, $rootScope, _;

  beforeEach(function () {
    angular.mock.module('restangular');
    angular.mock.inject(function ($injector) {
      BaseCreator = $injector.get('BaseCreator');
      Restangular = $injector.get('Restangular');
      $http = $injector.get('$http');
      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
      _ = $injector.get('$window')._;
    });
    bc = new BaseCreator();
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  it('should be a function', function () {
    expect(angular.isFunction(BaseCreator)).toBe(true);
  });

  describe('the constructor', function () {
    it('should take a config object parameter', function () {
      var config = {
        a: 'b'
      };
      var bc = new BaseCreator(config);
      expect(bc.config).toEqual(config);
    });

    it('should not require a parameter', function () {
      var bc = new BaseCreator();
      expect(bc.config).toBeUndefined();
    });
  });

  describe('function setConfig', function () {
    it('should set a config object', function () {
      var config = {
        a: 'b'
      };
      bc.setConfig(config);
      expect(bc.config).toEqual(config);
    });
    it('should overwrite the config if it exists', function () {
      var config1 = {
          a: 'b'
        },
        config2 = {
          c: 'd'
        };
      bc = new BaseCreator(config1);
      bc.setConfig(config2);
      expect(bc.config).toEqual(config2);
    });
    it('should return the BaseCreator instance', function () {
      expect(bc.setConfig({})).toBe(bc);
    });
  });

  describe('function parentsArray', function () {
    var config;
    beforeEach(function () {
      config = {
        restangularFields: {
          parentResource: 'parentResource'
        }
      };
      bc = new BaseCreator(config);
    });
    it('should return an array', function () {
      expect(bc.parentsArray()).toEqual(jasmine.any(Array));
    });
    it('should return the element if it has no parents', function () {
      var el = Restangular.one('account', 1);
      expect(bc.parentsArray(el)).toEqual([el]);
    });
    it('should return the element and its parents in reverse order', function () {
      var el = Restangular.all('accounts').one('user', 1).all('transactions').one('item', 2);
      var pa = bc.parentsArray(el);
      expect(pa[0]).toEqual(el.parentResource.parentResource.parentResource);
      expect(pa[1]).toEqual(el.parentResource.parentResource);
      expect(pa[2]).toEqual(el.parentResource);
      expect(pa[3]).toEqual(el);
    });
  });

  describe('function createRestangularResource', function () {
    var methodConfig, config, url, resource;
    beforeEach(function () {
      methodConfig = {
        getList: {
          method: 'GET',
          params: {},
          headers: {}
        },
        get: {
          method: 'GET',
          params: {q: 'abc'},
          headers: {'X-Foo-Bar': 'Yes'}
        },
        post: {
          method: 'POST',
          params: {},
          headers: {}
        },
        fooCustom: {
          method: 'POST',
          params: {custom: 'value'},
          headers: {'X-Custom': 'headerValue'}
        }
      };
      config = {
        defaultRequestParams: {
          get: {},
          post: {}
        }
      };
      config.isSafe = jasmine.createSpy();
      config.isSafe.and.returnValue(true);
      url = 'http://asdf.com/accounts/1';
      bc = new BaseCreator(config);
      resource = bc.createRestangularResource(url, methodConfig);
    });
    it('should return an object with the same method names as the given object', function () {
      var propertyNames = Object.getOwnPropertyNames(resource);
      expect(propertyNames).toEqual(['getList', 'get', 'post', 'fooCustom']);
    });
    it('should create a function for each method name', function () {
      expect(resource.getList).toEqual(jasmine.any(Function));
      expect(resource.get).toEqual(jasmine.any(Function));
      expect(resource.fooCustom).toEqual(jasmine.any(Function));
    });

    describe('produced method function', function () {
      it('should produce a function that makes an HTTP call', function () {
        $httpBackend.expectGET(/.*/).respond(200);
        resource.get();
        $httpBackend.flush();
      });
      it('should make a POST call when configured to do so', function () {
        config.isSafe.and.returnValue(false);
        $httpBackend.expectPOST(/.*/).respond(200);
        resource.fooCustom();
        $httpBackend.flush();
      });
      it('should call the specified url', function () {
        $httpBackend.expectGET('http://asdf.com/accounts/1').respond(200);
        resource.getList();
        $httpBackend.flush();
      });
      it('should use the query parameters from the methodConfig', function () {
        $httpBackend.expectGET('http://asdf.com/accounts/1?q=abc').respond(200);
        resource.get();
        $httpBackend.flush();
      });
      it('should use the defaultRequestParams for the given HTTP verb', function () {
        config.defaultRequestParams.get = {def: 'value'};
        bc = new BaseCreator(config);
        resource = bc.createRestangularResource(url, methodConfig);

        $httpBackend.expectGET('http://asdf.com/accounts/1?def=value&q=abc').respond(200);
        resource.get();
        $httpBackend.flush();
      });
      it('should use the defaultRequestParams over the methodConfig params', function () {
        // TODO: OR SHOULD IT??
        config.defaultRequestParams.get = {def: 'value', q: 'cde'};
        bc = new BaseCreator(config);
        resource = bc.createRestangularResource(url, methodConfig);

        $httpBackend.expectGET('http://asdf.com/accounts/1?def=value&q=cde').respond(200);
        resource.get();
        $httpBackend.flush();
      });
      it('should use post data passed to the function', function () {
        config.isSafe.and.returnValue(false);
        resource = bc.createRestangularResource(url, methodConfig);
        $httpBackend.expectPOST('http://asdf.com/accounts/1', {data: 'value'}).respond(200);
        resource.post({data: 'value'});
        $httpBackend.flush();
      });
      it('should use the given query parameters in a POST', function () {
        config.isSafe.and.returnValue(false);
        resource = bc.createRestangularResource(url, methodConfig);
        $httpBackend.expectPOST(
          'http://asdf.com/accounts/1?custom=value',
          {data: 'value'},
          function (headers) {
            return headers['X-Custom'] === 'headerValue';
          }
        ).respond(200);
        resource.fooCustom({data: 'value'});
        $httpBackend.flush();
      });
    });
  });

  describe('function resource', function () {
    var element;
    beforeEach(function() {
      Restangular.setBaseUrl('http://site.com');
      element = Restangular.one('accounts', 1);
      bc = new BaseCreator(Restangular.configuration);
      spyOn(bc, 'createRestangularResource');
      bc.base = jasmine.createSpy('base').and.returnValue('/accounts/1');
    });
    it('should call createRestangularResource', function () {
      bc.resource(element);
      expect(bc.createRestangularResource).toHaveBeenCalled();
    });
    it('return whatever createRestangularResource returns', function() {
      bc.createRestangularResource.and.returnValue({some: 'object'});
      expect(bc.resource(element)).toEqual({some: 'object'});
    });
    it('should clear the element\'s httpConfig', function() {
      // TODO: why??
      element._$httpConfig = {some: 'object'};
      bc.resource(element);
      expect(element._$httpConfig).toBeUndefined();
    });
    it('call createRestangularResource with the element url and a configuration object', function() {
      bc.resource(element);
      expect(bc.createRestangularResource).toHaveBeenCalledWith('/accounts/1', jasmine.any(Object));
    });
    describe('the generated url', function() {
      it('should have the given "path"', function() {
        bc.resource(element, {}, {}, {}, 'users');
        var url = bc.createRestangularResource.calls.argsFor(0)[0];
        expect(url).toEqual('/accounts/1/users');
      });
      it('should not have double slashes if the base url ends with a slash', function() {
        bc.base.and.returnValue('/accounts/1/');
        bc.resource(element, {}, {}, {}, 'users');
        var url = bc.createRestangularResource.calls.argsFor(0)[0];
        expect(url).toEqual('/accounts/1/users');
      });
      it('should have the configured suffix', function() {
        bc.config.suffix = '.json';
        bc.resource(element);
        var url = bc.createRestangularResource.calls.argsFor(0)[0];
        expect(url).toEqual('/accounts/1.json');
      });
      it('should not have a second suffix if one is already present on the url', function() {
        bc.base.and.returnValue('/accounts/1.json');
        bc.config.suffix = '.json';
        bc.resource(element);
        var url = bc.createRestangularResource.calls.argsFor(0)[0];
        expect(url).toEqual('/accounts/1.json');
      });
      it('should not have a suffix if the element has a selfUrl', function() {
        element.href = 'http://site.com/accounts/1';
        bc.config.suffix = '.json';
        bc.resource(element);
        var url = bc.createRestangularResource.calls.argsFor(0)[0];
        expect(url).toEqual('/accounts/1');
      });
    });
    describe('the generated configuration object', function() {
      var methods, obj;
      beforeEach(function() {
        methods = ['getList', 'get', 'jsonp', 'put', 'post', 'remove', 'head', 'trace', 'options', 'patch'];
        spyOn(bc.config, 'withHttpValues').and.callFake(function (objParam) {
          return objParam;
        });
        bc.resource(element);
        obj = bc.createRestangularResource.calls.argsFor(0)[1];
      });
      it('should have a property for each restangular method', function() {
        expect(_.keys(obj)).toEqual(methods);
      });
      it('should have method, params, and headers fields in each method property', function () {
        methods.forEach(function (method) {
          expect(_.keys(obj[method])).toEqual(['method', 'params', 'headers']);
        });
      });
      it('should use the given params in the object', function () {
        bc.resource(element, {}, {}, {query: 'value'});
        obj = bc.createRestangularResource.calls.argsFor(1)[1];
        methods.forEach(function (method) {
          expect(obj[method].params).toEqual({query: 'value'});
        });
      });
      it('should use the given headers in the object', function () {
        bc.resource(element, {}, {header: 'value'}, {});
        obj = bc.createRestangularResource.calls.argsFor(1)[1];
        methods.forEach(function (method) {
          expect(obj[method].headers).toEqual({header: 'value'});
        });
      });
      it('should call withHttpValues for each method in object', function () {
        expect(bc.config.withHttpValues.calls.count()).toEqual(methods.length);
      });
      it('should call withHttpValues with localHttpConfig as second argument', function () {
        bc.config.withHttpValues.calls.reset();
        var localHttpConfig = {
          params: {some: 'defaultValue', other: 'param'},
          headers: {header: 'defaultValue', other: 'header'},
          method: 'FOO',
          someCustom: 'property'
        };
        bc.resource(element, localHttpConfig, {header: 'value'}, {query: 'value'});
        expect(bc.config.withHttpValues.calls.allArgs()).toEqual(
          // make an array that contains [{}, localHttpConfig]
          _.times(10, _.constant([jasmine.any(Object), localHttpConfig]))
        );
      });
      it('should contain etag headers if etag is given on safe methods', function () {
        spyOn(bc.config, 'isSafe').and.returnValue(true);
        bc.resource(element, {}, {}, {}, null, '6938bcaa-69f2-451b-9f92-eb5ed70a0df8', 'operation');
        obj = bc.createRestangularResource.calls.argsFor(1)[1];
        expect(bc.config.isSafe).toHaveBeenCalledWith('operation');
        methods.forEach(function (method) {
          expect(obj[method].headers).toEqual({'If-None-Match': '6938bcaa-69f2-451b-9f92-eb5ed70a0df8'});
        });
      });
      it('should contain etag headers if etag is given on safe methods', function () {
        spyOn(bc.config, 'isSafe').and.returnValue(false);
        bc.resource(element, {}, {}, {}, null, '6938bcaa-69f2-451b-9f92-eb5ed70a0df8', 'operation');
        obj = bc.createRestangularResource.calls.argsFor(1)[1];
        expect(bc.config.isSafe).toHaveBeenCalledWith('operation');
        methods.forEach(function (method) {
          expect(obj[method].headers).toEqual({'If-Match': '6938bcaa-69f2-451b-9f92-eb5ed70a0df8'});
        });
      });
    });
  });

});
