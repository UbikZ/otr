'use strict';

var Organization = require('../models/organization');
var Setting = require('../models/setting');
var Project = require('../models/project');
var Document = require('../models/document');
var Version = require('../models/version');
var Entry = require('../models/entry');
var User = require('../models/user');
var mongoose = require('mongoose');
var http = require('./helpers/http');
var merge = require('merge');
var ontimeRequester = require('./helpers/ontime');
var mapping = require('../models/helpers/mapping');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/item';

  function saveOrganization(res, req, data, organization, modelItem, errorCode) {
    organization.save(function (err, newOrganization) {
      if (err) {
        http.log(req, 'Internal error: create item -> save organization', err);
        http.response(res, 500, {}, "-1", err);
      } else {
        newOrganization.populate('creation.user', function (err, newOrg) {
          http.response(res, 200, {organization: newOrg, item: modelItem, type: data.type + 's'}, errorCode);
        });
      }
    });
  }

  /*
   * Get Item (by filtering)
   */
  app.get(prefix, /*http.ensureAuthorized,*/ function (req, res) {
    var data = req.query;
    //http.checkAuthorized(req, res, function () {
      Organization.findById(data.organizationId, function (err, organization) {
        if (err) {
          http.log(req, 'Internal error: get organization', err);
          http.response(res, 500, {}, "-1", err);
        } else if (organization) {
          // todo: optimize with lazy loading for 'version' (do not load 'entries' attribute)
          organization.findDeepAttributeById(data.itemId, function (element) {
            if (element != undefined) {
              http.response(res, 200, {organization: organization, item: element});
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
    //});
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

            saveOrganization(res, req, data, organization, undefined, 4);
            /*organization.save(function (err, newOrganization) {
              if (err) {
                http.log(req, 'Internal error: organization found -> save organization', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, item: itemModel}, "4");
                });
              }
            });*/
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

            if (data.parentId != undefined) {
              organization.findDeepAttributeById(data.parentId, function (element) {
                if (element != undefined) {
                  if (data.type == "project") {
                    modelItem = new Project(item);
                    element.projects.push(modelItem);
                    saveOrganization(res, req, data, organization, modelItem, 2);
                  } else if (data.type == "document") {
                    modelItem = new Document(item);
                    element.documents.push(modelItem);
                    saveOrganization(res, req, data, organization, modelItem, 2);
                  } else if (data.type == "version") {
                    if (data.ontimeId != undefined) {
                      modelItem = new Version(item);
                      modelItem.update = modelItem.creation = {user: user._id, date: new Date()};
                      ontimeRequester.items(req.ot_token, data.ontimeId, function (result) {
                        result = JSON.parse(result);
                        if (result.error) {
                          http.log(req, 'Ontime Error: ' + result.error_description);
                          http.response(res, 403, {error: result}, "-3", result.error);
                        } else if (result.data) {
                          var elements = [];
                          result.data.forEach(function(item) {
                            var indexOfParentProject = elements.pluck('ontime_id').indexOf(item.parent_project.id);
                            if (indexOfParentProject == -1) {
                              elements.push(new Entry({
                                name: item.parent_project.name,
                                ontime_id: item.parent_project.id,
                                path: item.parent_project.path ? item.parent_project.path.split('\\') : [],
                                children: [],
                              }));
                              indexOfParentProject = elements.length - 1;
                            }

                            var indexOfProject =
                              elements[indexOfParentProject].children.pluck('ontime_id').indexOf(item.project.id);
                            if (indexOfProject == -1) {
                              elements[indexOfParentProject].children.push(new Entry({
                                name: item.project.name,
                                ontime_id: item.project.id,
                                path: item.project.path ? item.project.path.split('\\') : [],
                                children: [],
                              }));
                              indexOfProject = elements[indexOfParentProject].children.length - 1;
                            }

                            elements[indexOfParentProject].children[indexOfProject].children.push(new Entry({
                              name: item.name,
                              description: item.description,
                              notes: item.notes,
                              ontime_id: item.id,
                              estimate: {
                                duration_minutes: item.estimated_duration.duration_minutes,
                                otr_low: item.custom_fields != undefined ? item.custom_fields.custom_257 : null,
                                otr_high: item.custom_fields != undefined ? item.custom_fields.custom_259 : null,
                                otr_isEstimated: item.custom_fields != undefined ? item.custom_fields.custom_262 : null,
                              },
                            }));

                            // Count

                            if (elements[indexOfParentProject].size == undefined) {
                              elements[indexOfParentProject].size = 0;
                            }
                            elements[indexOfParentProject].size++;
                            if (elements[indexOfParentProject].children[indexOfProject].size == undefined) {
                              elements[indexOfParentProject].children[indexOfProject].size = 0;
                            }
                            elements[indexOfParentProject].children[indexOfProject].size++;
                            
                            // Sum of parent project entries

                            if (elements[indexOfParentProject].estimate.duration_minutes == undefined) {
                              elements[indexOfParentProject].estimate.duration_minutes = 0;
                            }
                            elements[indexOfParentProject].estimate.duration_minutes += item.estimated_duration.duration_minutes;
                            if (elements[indexOfParentProject].estimate.otr_low == undefined) {
                              elements[indexOfParentProject].estimate.otr_low = 0;
                            }
                            elements[indexOfParentProject].estimate.otr_low +=
                              item.custom_fields != undefined ? item.custom_fields.custom_257 : 0;
                            if (elements[indexOfParentProject].estimate.otr_high == undefined) {
                              elements[indexOfParentProject].estimate.otr_high = 0;
                            }
                            elements[indexOfParentProject].estimate.otr_high +=
                              item.custom_fields != undefined ? item.custom_fields.custom_259 : 0;

                            // Sum of parent project entries
                            if (elements[indexOfParentProject].children[indexOfProject].estimate.duration_minutes == undefined) {
                              elements[indexOfParentProject].children[indexOfProject].estimate.duration_minutes = 0;
                            }
                            elements[indexOfParentProject].children[indexOfProject].estimate.duration_minutes += item.estimated_duration.duration_minutes;
                            if (elements[indexOfParentProject].children[indexOfProject].estimate.otr_low == undefined) {
                              elements[indexOfParentProject].children[indexOfProject].estimate.otr_low = 0;
                            }
                            elements[indexOfParentProject].children[indexOfProject].estimate.otr_low +=
                              item.custom_fields != undefined ? item.custom_fields.custom_257 : 0;
                            if (elements[indexOfParentProject].children[indexOfProject].estimate.otr_high == undefined) {
                              elements[indexOfParentProject].children[indexOfProject].estimate.otr_high = 0;
                            }
                            elements[indexOfParentProject].children[indexOfProject].estimate.otr_high +=
                              item.custom_fields != undefined ? item.custom_fields.custom_259 : 0;
                          });

                          modelItem.entries = elements;
                          modelItem.setting = new Setting(mapping.settingDtoToDal(undefined, data.setting));
                          element.versions.push(modelItem);
                          saveOrganization(res, req, data, organization, modelItem, 2);
                          /*organization.save(function (err, newOrganization) {
                            if (err) {
                              http.log(req, 'Internal error: create item (version) -> save organization', err);
                              http.response(res, 500, {}, "-1", err);
                            } else {
                              newOrganization.populate('creation.user', function (err, newOrg) {
                                http.response(res, 200, {organization: newOrg, item: modelItem, type: data.type + 's'}, "2");
                              });
                            }
                          });*/
                        } else {
                          http.log(req, 'Ontime Error: issue during OnTime "/items" request');
                          http.response(res, 500, {}, "-1");
                        }
                      });
                    } else {
                      http.log(req, 'Error: item creation (version one) failed (data.ontimeId is undefined).');
                      http.response(res, 404, {}, "-7");
                    }

                  } else {
                    http.log(req, 'Error: item creation failed (data.type is undefined).');
                    http.response(res, 404, {}, "-7");
                  }
                } else {
                  http.log(req, 'Error: project not found (data.parentId = ' + data.parentId + ').');
                  http.response(res, 404, {}, "-7");
                }
              });
            } else if (data.type == "project") {
              modelItem = new Project(item);
              organization.projects.push(modelItem);
              saveOrganization(res, req, data, organization, modelItem, 2);
              /*organization.save(function (err, newOrganization) {
                if (err) {
                  http.log(req, 'Internal error: create item -> save organization', err);
                  http.response(res, 500, {}, "-1", err);
                } else {
                  newOrganization.populate('creation.user', function (err, newOrg) {
                    http.response(res, 200, {organization: newOrg, item: modelItem, type: data.type + 's'}, "2");
                  });
                }
              });*/
            } else {
              http.log(req, 'Error: item creation failed (data.parentId is undefined).');
              http.response(res, 404, {}, "-7");
            }
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
                  http.log(req, 'Error: item not found (data._id = ' + data._id + ').');
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
