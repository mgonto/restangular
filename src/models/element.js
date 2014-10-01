
function RestangularElement(config, urlHandler) {
  this.__config = config;
  this.__urlHandler = urlHandler;
  // route y reqParams restangularized fromServer
}

mixin(RestangularElement, RestangularBase, { chain: false });