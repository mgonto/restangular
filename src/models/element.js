
function RestangularElement(config, urlHandler, restangularizeElem) {
  this.$config = config;
  this.$urlHandler = urlHandler;
  this.$restangularizeElem = restangularizeElem;
  // route y reqParams restangularized fromServer
}

mixin(RestangularElement, RestangularBase, { chain: false });