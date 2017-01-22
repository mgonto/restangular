/* jshint jasmine: true */
describe('Path', function () {

  var Restangular, BaseCreator, Path, path;

  beforeEach(function () {
    angular.mock.module('restangular');
    angular.mock.inject(function ($injector) {
      Restangular = $injector.get('Restangular');
      Path = $injector.get('Path');
      BaseCreator = $injector.get('BaseCreator');
      path = new Path(Restangular.configuration);
    });
  });

  it('should be a function', function () {
    expect(angular.isFunction(Path)).toEqual(true);
  });

  it('should be a subclass of BaseCreator', function () {
    expect(Path.prototype instanceof BaseCreator).toBe(true);
    expect(Path.prototype.constructor).toBe(BaseCreator);
  });

  describe('function normalizeUrl', function() {
    // TODO: what's the meaning of all this?
    it('should not change absolute urls without path', function () {
      expect(path.normalizeUrl('http://site.com')).toEqual('http://site.com');
    });
    it('should not change absolute urls with path', function () {
      expect(path.normalizeUrl('http://site.com/some/path')).toEqual('http://site.com/some/path');
    });
    it('should not change https urls without path', function () {
      expect(path.normalizeUrl('https://site.com')).toEqual('https://site.com');
    });
    it('should not change https urls without path', function () {
      expect(path.normalizeUrl('https://site.com/some/path')).toEqual('https://site.com/some/path');
    });
    it('should not change relative urls (without protocol)', function () {
      expect(path.normalizeUrl('site.com/some/path')).toEqual('site.com/some/path');
    });
    it('should not change only a double slash at the beginning', function () {
      // TODO: or should it?
      expect(path.normalizeUrl('//site.com/some/path')).toEqual('//site.com/some/path');
    });
    it('should unescape escaped slashes', function () {
      expect(path.normalizeUrl('https:\/\/site.com\/some\/path\/')).toEqual('https://site.com/some/path/');
    });
    it('should replace double slashes with single in the path part', function () {
      expect(path.normalizeUrl('https://site.com//some//path//')).toEqual('https://site.com/some/path/');
    });
    it('should replace triple slashes with single in the path part', function () {
      expect(path.normalizeUrl('https://site.com///some///path///')).toEqual('https://site.com/some/path/');
    });
    it('should replace double backslashes with single in the path part', function () {
      expect(path.normalizeUrl('https://site.com\\some\\path\\')).toEqual('https://site.com/some/path/');
    });
    it('should replace multiple backslashes with single in the path part', function () {
      expect(path.normalizeUrl('https://site.com\\\\some\\\\path\\\\')).toEqual('https://site.com/some/path/');
    });
  });

  describe('function base', function() {
    it('should return a string', function () {
      var element = Restangular.one('accounts', 1);
      expect(path.base(element)).toEqual(jasmine.any(String));
    });
    describe('for parentless elements', function() {
      it('should return the element self link if its an absolute url', function () {
        var element = Restangular.one('accounts', 1);
        element.href = 'http://site.com/accounts/one';
        expect(path.base(element)).toEqual('http://site.com/accounts/one');
      });
      it('should return the self link beginning with a slash if the self link is set to be relative', function () {
        Restangular.setSelfLinkAbsoluteUrl(false);
        var element = Restangular.one('accounts', 1);
        element.href = 'accounts/one';
        expect(path.base(element)).toEqual('/accounts/one');
      });
      it('should return the path if the element is a collection', function () {
        var collection = Restangular.all('accounts');
        expect(path.base(collection)).toEqual('/accounts');
      });
      it('should return a correct url for collection with ids', function () {
        var collection = Restangular.several('accounts', 1, 2, 3);
        expect(path.base(collection)).toEqual('/accounts/1,2,3');
      });
      it('should return the canonical id if such is configured', function () {
        Restangular.setUseCannonicalId(true);
        var element = Restangular.one('accounts', 1);
        element.id = '123';
        expect(path.base(element)).toEqual('/accounts/1');
      });
      it('should not add the id to the path if it is not valid', function () {
        var element = Restangular.one('accounts', '');
        expect(path.base(element)).toEqual('/accounts');
      });
      it('should url-encode the id if instructed so', function () {
        Restangular.setEncodeIds(true);
        var element = Restangular.one('accounts', '1:2');
        expect(path.base(element)).toEqual('/accounts/1%3A2');
      });
      it('should leave the id unencoded if instructed so', function () {
        Restangular.setEncodeIds(false);
        var element = Restangular.one('accounts', '1:2');
        expect(path.base(element)).toEqual('/accounts/1:2');
      });
    });
    describe('with parents', function() {
      it('should combine the parent\ss paths', function () {
        var element = Restangular.all('accounts').one('users', 1).one('transactions', 12).one('rows', 44);
        expect(path.base(element)).toEqual('/accounts/users/1/transactions/12/rows/44');
      });
    });
  });

});
