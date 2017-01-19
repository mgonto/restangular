/* jshint jasmine: true */
describe('BaseCreator', function () {

  var Restangular, BaseCreator, bc, $http;

  beforeEach(function () {
    angular.mock.module('restangular');
    angular.mock.inject(function ($injector) {
      BaseCreator = $injector.get('BaseCreator');
      Restangular = $injector.get('Restangular');
      $http = $injector.get('$http');
    });
    bc = new BaseCreator();
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
    var methodConfig, config, url;
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
        foo: {
          method: 'POST',
          params: {},
          headers: {}
        }
      };
      config = {
        defaultRequestParams: {
          getList: {},
          get: {},
          foo: {}
        }
      };
      config.isSafe = jasmine.createSpy();
      config.isSafe.and.returnValue(true);
      url = 'http://asdf.com/accounts/1';
    });
    it('should return an object with the same method names as the given object', function () {
      bc = new BaseCreator(config);
      var resource = bc.createRestangularResource(url, methodConfig);
      var propertyNames = Object.getOwnPropertyNames(resource);
      expect(propertyNames).toEqual(['getList', 'get', 'foo']);
    });
    it('should create a function for each method name', function () {
      bc = new BaseCreator(config);
      var resource = bc.createRestangularResource(url, methodConfig);
      expect(resource.getList).toEqual(jasmine.any(Function));
      expect(resource.get).toEqual(jasmine.any(Function));
      expect(resource.foo).toEqual(jasmine.any(Function));
    });
    describe('produced method function', function () {
      it('should produce a function that calls $http', function () {

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
