/* jshint jasmine: true */
describe('BaseCreator', function () {

  var Restangular, BaseCreator, bc, $http, $httpBackend, $rootScope;

  beforeEach(function () {
    angular.mock.module('restangular');
    angular.mock.inject(function ($injector) {
      BaseCreator = $injector.get('BaseCreator');
      Restangular = $injector.get('Restangular');
      $http = $injector.get('$http');
      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
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
    // it('should extend the query params with the defaultRequestParams', function () {
    //   config.defaultRequestParams.foo = {
    //     custom: 'value'
    //   };
    //   bc = new BaseCreator(config);
    //   var resource = bc.createRestangularResource($http, url, methodConfig);
    //   expect(resource.params).toEqual({
    //     custom: 'value'
    //   })
    // });
  });

});
