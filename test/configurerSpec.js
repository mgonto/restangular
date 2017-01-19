describe('Configurer', function () {

  var Configurer;

  beforeEach(function () {
    angular.mock.module('restangular');
    angular.mock.inject(function ($injector) {
      Configurer = $injector.get('Configurer');
    });
  });

  it('should be an object', function () {
    expect(angular.isObject(Configurer)).toBeTruthy();
  });

});
