'use strict';

var Organization = require('../models/organization');
var Project = require('../models/project');
var Document = require('../models/document');
var User = require('../models/user');
var mongoose = require('mongoose');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/item';

  /*
   * Get users (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      Organization.findById(data.organizationId, function (err, organization) {
        if (err) {
          http.response(res, 500, "An error occurred.", err);
        } else if (organization) {
          organization.findDeepAttributeById(data.itemId, function (element) {
            if (element != undefined) {
              http.response(res, 200, {item: element});
            } else {
              http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
            }
          });
        } else {
          http.response(res, 404, {}, "Organization for item loading not found.", err);
        }
      });
    });
  });

  app.post(prefix + '/delete', http.ensureAuthorized, function (req, res) {
    var data = req.body;

    http.checkAuthorized(req, res, function () {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.response(res, 500, "An error occurred.", err);
          } else if (organization) {
            var itemModel;
            if (data.itemId != undefined) {
              organization.findDeepAttributeById(data.itemId, function (element) {
                if (element != undefined) {
                  itemModel = element;
                  element.remove();
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else {
              http.response(res, 404, {}, "Item to delete not found.", err);
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.response(res, 500, {}, "An error occurred.", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, item: itemModel});
                });
              }
            });
          } else {
            http.response(res, 404, {}, "Organization not found.", err);
          }
        });
      } else {
        http.response(res, 404, {}, "Wrong parameters.");
      }
    });
  });

  app.post(prefix + '/create', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function (user) {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.response(res, 500, "An error occurred.", err);
          } else if (organization) {
            var item, modelItem;

            if (data.type) {
              item = {
                name: data.name,
                description: data.description,
                update: {user: user._id, date: new Date()},
                creation: {user: user._id, date: new Date()},
              };
            }

            if (data.projectId != undefined) {
              organization.findDeepAttributeById(data.projectId, function (element) {
                if (element != undefined) {
                  if (data.type == "project") {
                    modelItem = element.projects.create(item);
                    element.projects.push(modelItem);
                  }
                  if (data.type == "document") {
                    modelItem = element.documents.create(item);
                    element.documents.push(modelItem);
                  }
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else if (data.type == "project") {
              modelItem = organization.projects.create(item);
              organization.projects.push(modelItem);
            } else if (data.type == "document") {
              modelItem = organization.documents.create(item);
              organization.documents.push(modelItem);
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.response(res, 500, {}, "An error occurred.", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, item: modelItem});
                });
              }
            });
          } else {
            http.response(res, 404, {}, "Organization not found.", err);
          }
        });
      } else {
        http.response(res, 404, {}, "Wrong parameters.");
      }
    });
  });

  app.post(prefix + '/update', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function (user) {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.response(res, 500, "An error occurred.", err);
          } else if (organization) {
            var item = {}, modelItem;

            if (data.name != undefined) {
              item.name = data.name;
            }
            if (data.description != undefined) {
              item.description = data.description;
            }
            item.update = {user: user._id, date: new Date()};

            if (data._id != undefined) {
              organization.findDeepAttributeById(data._id, function (element) {
                if (element != undefined) {
                  element = modelItem = Object.assign(element, item);
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else {
              http.response(res, 404, {}, "Item to update not found.", err);
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.response(res, 500, {}, "An error occurred.", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, item: modelItem});
                });
              }
            });
          } else {
            http.response(res, 404, {}, "Organization not found.", err);
          }
        });
      } else {
        http.response(res, 404, {}, "Wrong parameters.");
      }
    });
  });
};
