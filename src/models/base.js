
var RestangularBase = {
  getRestangularUrl: function() {
    return this.$urlHandler.fetchUrl(this);
  },
  getRequestedUrl: function() {
    return this.$urlHandler.fetchRequestedUrl(this);
  },
  clone: function() {
    var copiedElement = _.cloneDeep(this);
    // TODO remove restangularizeElem() call
    return this.$restangularizeElem(copiedElement[this.$config.restangularFields.parentResource],
            copiedElement, copiedElement[this.$config.restangularFields.route], true);
  }

};
