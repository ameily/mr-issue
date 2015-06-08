
var yaml = require('yamljs');
var _ = require('underscore');
var util = require('util');

function getBool(val) {
  if(!_.isString(val)) {
    return val;
  }

  var t = val.toLowerCase();
  return ['t', 'true', 'y', 'yes', 'on', '1'].indexOf(t) >= 0;
}

function MrIssueConfig() {
  var data = yaml.load("./config.yml");
  var self = this;

  this.redmine = data.redmine;
  this.redmine.impersonate = getBool(data.redmine.impersonate);
  this.projects = [];

  var globalActions = data.redmine.actions || {};

  _.each(data.projects, function(name) {
    var project = data[name];

    project.name = name;

    for(var actionName in globalActions) {
      project.actions[actionName] = _.defaults({}, project.actions[actionName], globalActions[actionName]);
    }

    /*
    for(var actionName in projData.actions) {
      console.log("Globals: " + util.inspect(globalActions[actionName]));
      projData.actions[actionName] = _.defaults({}, projData.actions[actionName], globalActions[actionName]);
    }
    */

    self.projects.push(project);
  });
}

MrIssueConfig.prototype.getUserLookups = function() {
  var lookups = [];

  _.each(this.projects, function(project) {
    //_.each(project.actions, function(actionName) {
    for(var actionName in project.actions) {
      var actions = project.actions[actionName];
      if(actions.assignee) {
        console.log("Lookup: " + actions.assignee);
        lookups.push(actions.assignee);
      }
    }
  });

  return _.uniq(lookups);
};

MrIssueConfig.prototype.getIssueStatusLookups = function() {
  var lookups = [];

  _.each(this.projects, function(project) {
    for(var actionName in project.actions) {
      var actions = project.actions[actionName];
      if(actions.status) {
        lookups.push(actions.status);
      }
    }
  });

  return _.uniq(lookups);
}

MrIssueConfig.prototype.getProjectConfig = function(url) {
  var name = url.substring(1);
  for(var i in this.projects) {
    var proj = this.projects[i];
    if(proj.name == name) {
      return proj;
    }
  }
  return null;
};

module.exports = MrIssueConfig;
