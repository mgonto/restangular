
function RestangularCollection(service) {
  this.$service = service;
  this.$config = service.config;
  // route y reqParams restangularized fromServer
}

// TODO proper way of doing inheritance or Array like object
RestangularCollection.prototype = new Array();

mixin(RestangularCollection, RestangularBase, { chain: false });


RestangularCollection.prototype.post = function (elem, params, headers) {
  return _.bind(elemFunction, this)('post', null, params, elem, headers);
};