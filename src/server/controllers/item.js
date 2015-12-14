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
      var criteria = {};
      if (data.id) {
        criteria = {_id: new mongoose.Types.ObjectId(data.id)};
      }

      var query = Organization.find(criteria).populate('creation.user');

      if (data.populate === true) {
        query.populate('projects').populate('settings');
      }

      query.exec(function (err, organizations) {
        if (err) {
          http.response(res, 500, "An error occurred.", err);
        } else if (organizations) {
          http.response(res, 200, {organizations: organizations});
        } else {
          http.response(res, 404, {}, "User not found.", err);
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
            if (data.projectId != undefined) {
              organization.findDeepAttributeById(data.projectId, 'projects', function (element) {
                if (element != undefined) {
                  element.remove();
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else if (data.documentId != undefined) {
              organization.findDeepAttributeById(data.projectId, 'documents', function (element) {
                if (element != undefined) {
                  element.remove();
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else {
              // todo
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.response(res, 500, {}, "An error occurred.", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg});
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
            var item;

            if (data.type) {
              item = {
                name: data.name,
                description: data.description,
                update: {user: user._id, date: new Date()},
                creation: {user: user._id, date: new Date()},
              };
            }

            if (data.projectId) {
              organization.findDeepAttributeById(data.projectId, 'projects', function (element) {
                if (element != undefined) {
                  if (data.type == "project") {
                    element.projects.push(item);
                  }
                  if (data.type == "document") {
                    element.documents.push(item);
                  }
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else if (data.type == "project") {
              organization.projects.push(item);
            } else {
              // todo
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.response(res, 500, {}, "An error occurred.", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg});
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
            if (data.projectId) {
              organization.findDeepAttributeById(data.projectId, 'projects', function (element) {
                if (element != undefined) {
                  element.name = data.name;
                  element.description = data.description;
                  element.update  = {user: user._id, date: new Date()};
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else if (data.documentId) {
              organization.findDeepAttributeById(data.documentId, 'projects', function (element) {
                if (element != undefined) {
                  // todo
                } else {
                  http.response(res, 404, {}, "Impossible to retrieve attached project.", err);
                }
              });
            } else {
              // todo
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.response(res, 500, {}, "An error occurred.", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg});
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
