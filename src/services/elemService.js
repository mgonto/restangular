function ElemService(config) {
  this.config = config;
}

ElemService.prototype.getCannonicalIdFromElem = function (elem) {
  var cannonicalId = elem[this.config.restangularFields.cannonicalId];
  var actualId = this.isValidId(cannonicalId) ? cannonicalId : this.getIdFromElem(elem);
  return actualId;
};

ElemService.prototype.getCannonicalIdFromElem = function (elem) {
  var cannonicalId = elem[this.config.restangularFields.cannonicalId];
  var actualId = this.isValidId(cannonicalId) ? cannonicalId : this.getIdFromElem(elem);
  return actualId;
};

ElemService.prototype.setFieldToElem = function (field, elem, value) {
  var properties = field.split('.');
  var idValue = elem;
  _.each(_.initial(properties), function (prop) {
    idValue[prop] = {};
    idValue = idValue[prop];
  });
  idValue[_.last(properties)] = value;
  return this;
};

ElemService.prototype.getFieldFromElem = function (field, elem) {
  var properties = field.split('.');
  var idValue = elem;
  _.each(properties, function (prop) {
    if (idValue) {
      idValue = idValue[prop];
    }
  });
  return angular.copy(idValue);
};

ElemService.prototype.setIdToElem = function (elem, id) {
  this.setFieldToElem(this.config.restangularFields.id, elem, id);
  return this;
};

ElemService.prototype.getIdFromElem = function (elem) {
  return this.getFieldFromElem(this.config.restangularFields.id, elem);
};

ElemService.prototype.isValidId = function (elemId) {
  return '' !== elemId && !_.isUndefined(elemId) && !_.isNull(elemId);
};

ElemService.prototype.setUrlToElem = function (elem, url) {
  this.setFieldToElem(this.config.restangularFields.selfLink, elem, url);
  return this;
};

ElemService.prototype..getUrlFromElem = function (elem) {
  return this.getFieldFromElem(this.config.restangularFields.selfLink, elem);
};



ElemService.prototype.isRestangularized = function (obj) {
  return !!obj[this.config.restangularFields.restangularized];
};
