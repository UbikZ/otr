'use strict';

var Organization = require('../models/organization');
var Project = require('../models/project');
var Document = require('../models/document');
var User = require('../models/user');
var mongoose = require('mongoose');
var http = require('./helpers/http');
var merge = require('merge');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/item';

  /*
   * Get Organization (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      Organization.findById(data.organizationId, function (err, organization) {
        if (err) {
          http.log(req, 'Internal error: get organization', err);
          http.response(res, 500, {}, "-1", err);
        } else if (organization) {
          organization.findDeepAttributeById(data.itemId, function (element) {
            if (element != undefined) {
              http.response(res, 200, {item: element});
            } else {
              http.log(req, 'Error: item with id (' + data.itemId + ') for "get request" not found.');
              http.response(res, 404, {}, "-6");
            }
          });
        } else {
          http.log(req, 'Error: organization with id (' + data.organizationId + ') not found.');
          http.response(res, 404, {}, "-5");
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
            http.log(req, 'Internal error: get organization', err);
            http.response(res, 500, {}, "-1", err);
          } else if (organization) {
            var itemModel;
            if (data.itemId != undefined) {
              organization.findDeepAttributeById(data.itemId, function (element) {
                if (element != undefined) {
                  itemModel = element;
                  element.remove();
                } else {
                  http.log(req, 'Error: item with id (' + data.itemId + ') for "delete request" not found.');
                  http.response(res, 404, {}, "-6");
                }
              });
            } else {
              http.log(req, 'Error: item id is not defined -> can\'t delete item.');
              http.response(res, 404, {}, "-6");
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.log(req, 'Internal error: organization found -> save organization', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, item: itemModel}, "4");
                });
              }
            });
          } else {
            http.log(req, 'Error: organization with id (' + data.organizationId + ') not found.');
            http.response(res, 404, {}, "-5");
          }
        });
      } else {
        http.log(req, 'Internal error: wrong parameters in "items/delete"');
        http.response(res, 404, {}, "-1");
      }
    });
  });

  app.post(prefix + '/create', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function (user) {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.log(req, 'Internal error: create item', err);
            http.response(res, 500, {}, "-1", err);
          } else if (organization) {
            var modelItem;

            var item = {
              name: data.name,
              description: data.description,
              update: {user: user._id, date: new Date()},
              creation: {user: user._id, date: new Date()},
            };

            if (data.projectId != undefined) {
              organization.findDeepAttributeById(data.projectId, function (element) {
                if (element != undefined) {
                  if (data.type == "project") {
                    modelItem = new Project(item);
                    element.projects.push(modelItem);
                  } else if (data.type == "document") {
                    modelItem = new Document(item);
                    element.documents.push(modelItem);
                  } else {
                    http.log(req, 'Error: item creation failed (data.type is undefined).');
                    http.response(res, 404, {}, "-7");
                  }
                } else {
                  http.log(req, 'Error: project not found (data.projectId = ' + data.projectId + ').');
                  http.response(res, 404, {}, "-7");
                }
              });
            } else if (data.type == "project") {
              modelItem = new Project(item);
              organization.projects.push(modelItem);
            } else {
              http.log(req, 'Error: item creation failed (data.projectId is undefined).');
              http.response(res, 404, {}, "-7");
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.log(req, 'Internal error: create item -> save organization', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, item: modelItem, type: data.type + 's'}, "2");
                });
              }
            });
          } else {
            http.log(req, 'Error: organization with id (' + data.organizationId + ') not found.');
            http.response(res, 404, {}, "-5");
          }
        });
      } else {
        http.log(req, 'Internal error: wrong parameters in "items/create"');
        http.response(res, 404, {}, "-1");
      }
    });
  });

  app.post(prefix + '/update', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function (user) {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.log(req, 'Internal error: update item', err);
            http.response(res, 500, {}, "-1", err);
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
                  http.log(req, 'Error: project not found (data.projectId = ' + data.projectId + ').');
                  http.response(res, 404, {}, "-8");
                }
              });
            } else {
              http.log(req, 'Error: item to update not found (data._id = undefined).');
              http.response(res, 404, {}, "-8");
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.log(req, 'Internal error: update item -> save organization', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  // todo : not really pretty
                  var type = modelItem.projects == undefined ? 'documents' : 'projects';
                  http.response(res, 200, {organization: newOrg, item: modelItem, type: type}, "3");
                });
              }
            });
          } else {
            http.log(req, 'Error: organization with id (' + data.organizationId + ') not found.');
            http.response(res, 404, {}, "-5");
          }
        });
      } else {
        http.log(req, 'Internal error: wrong parameters in "items/update"');
        http.response(res, 404, {}, "-1");
      }
    });
  });
};
