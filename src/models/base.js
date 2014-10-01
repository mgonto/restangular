
var RestangularBase = {
  getRestangularUrl: function() {
    return this.__urlHandler.fetchUrl(this);
  },
  getRequestedUrl: function() {
    return this.__urlHandler.fetchRequestedUrl(this);
  }

};
