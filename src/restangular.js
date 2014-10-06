var module = angular.module('restangular', []);

module.provider('Restangular', function() {
  // Configuration
  var globalConfiguration = {};

  Configurer.init(this, globalConfiguration);

  this.$get = ['$http', '$q', function($http, $q) {

    return new RestangularService(globalConfiguration);
  }];
});
