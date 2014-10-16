
function RestangularCollection(service, elements) {
  this.$service = service;
  this.$config = service.config;
  this.elements = _.clone(elements);

  // TODO shouldn't be necessary
  this.restangularCollection = true;
  // route y reqParams restangularized fromServer

}

// subclass extends superclass
RestangularCollection.prototype = Object.create(RestangularBase.prototype);
RestangularCollection.prototype.constructor = RestangularCollection;

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

/**
 * Defines length property
 */
Object.defineProperty(RestangularCollection.prototype, 'length', {
  get: function() {
    return this.elements.length;
  }
});

/**
 * Retrieves element at given index
 * @param index {integer}
 * @returns {RestangularElement}
 */
RestangularCollection.prototype.at = function(index) {
  return this.elements[index];
};

/**
 * Applies _.forEach to collection elements.
 *
 * Check lodash|underscore _.forEach function
 */
RestangularCollection.prototype.forEach = function(callback, thisArg) {
  _.forEach(this.elements, callback, thisArg);
};

/**
 * Applies _.map to collection elements.
 *
 * Check lodash|underscore _.map function
 */
RestangularCollection.prototype.map = function(callback, thisArg) {
  _.map(this.elements, callback, thisArg);
};

/**
 * Applies _.find to collection elements.
 *
 * Check lodash|underscore _.find function
 */
RestangularCollection.prototype.find = function(callback, thisArg) {
  _.find(this.elements, callback, thisArg);
};
/**
 * Applies _.findIndex to collection elements.
 *
 * Check lodash|underscore _.findIndex function
 */
RestangularCollection.prototype.findIndex = function(callback, thisArg) {
  _.findIndex(this.elements, callback, thisArg);
};
/**
 * Applies _.indexOf to collection elements.
 *
 * Check lodash|underscore _.indexOf function
 */
RestangularCollection.prototype.indexOf = function(callback, thisArg) {
  _.indexOf(this.elements, callback, thisArg);
};
