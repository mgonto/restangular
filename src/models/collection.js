
function RestangularCollection(service) {
  this.$service = service;
  this.$config = service.config;

  // TODO shouldn't be necessary
  this.restangularCollection = true;
  // route y reqParams restangularized fromServer
}

// TODO proper way of doing inheritance or Array like object
RestangularCollection.prototype = new Array();

mixin(RestangularCollection, new RestangularBase(), { chain: false });

RestangularCollection.prototype.getById = function(id, reqParams, headers){
  return this.customGET(id.toString(), reqParams, headers);
};


RestangularCollection.prototype.post = function (elem, params, headers) {
  return this.$service.elemFunction(this, 'post', null, params, elem, headers);
};

// TODO improve signature
RestangularCollection.prototype.getList = function (/* same arguments as fetchList */) {
  return this.$service.fetchList.apply(this.$service, [this, null].concat(arguments));
};