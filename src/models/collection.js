
function RestangularCollection(service) {
  this.$service = service;
  this.$config = service.config;

  // TODO shouldn't be necessary
  this.restangularCollection = true;
  // route y reqParams restangularized fromServer
}

// TODO proper way of doing inheritance or Array like object
RestangularCollection.prototype = new Array();

mixin(RestangularCollection, RestangularBase, { chain: false });

RestangularCollection.prototype.getById = function(id, reqParams, headers){
  return this.customGET(id.toString(), reqParams, headers);
};


RestangularCollection.prototype.post = function (elem, params, headers) {
  return _.bind(elemFunction, this)('post', null, params, elem, headers);
};

// TODO improve signature
RestangularElement.prototype.getList = function (/* same arguments as fetchList */) {
  return this.$service.fetchList.apply(this.$service, [this, null].concat(arguments));
};