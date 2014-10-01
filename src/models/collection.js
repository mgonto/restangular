
function RestangularCollection(config, urlHandler) {
  this.$config = config;
  this.$urlHandler = urlHandler;
  // route y reqParams restangularized fromServer
}

// TODO proper way of doing inheritance or Array like object
RestangularCollection.prototype = new Array();

mixin(RestangularCollection, RestangularBase, { chain: false });
