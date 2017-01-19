describe('Path', function () {

  var Path;

  beforeEach(function () {
    angular.mock.module('restangular');
    angular.mock.inject(function ($injector) {
      Path = $injector.get('Path');
    });
  });

  it('should be a function', function () {
    expect(angular.isFunction(Path)).toEqual(true);
  });

});
