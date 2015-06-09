///
/// @copyright 2015 Adam Meily <meily.adam@gmail.com>
///


var Redmine = require('./redmine');
var _ = require('underscore');
var async = require('async');
var util = require('util');
var logger = require('./logger');


///
/// Perform async.mapSeries, ignoring errors...
///
function asyncMapIgnoreErrors(arr, iterator, callback) {
  var it = function(item, cb) {
    iterator(item, function(err, result) {
      cb(null, err ? null : result);
    });
  };

  async.mapSeries(arr, it, callback);
}


///
/// Logic driver for Mr. Issue. Receives Gitlab merge request webhooks and then
/// updates the corresponding issue(s) in Redmine.
///
function MrIssueDriver(config, cb) {
  this.config = config;
  logger.info("initializing mr-issue");

  this.redmine = new Redmine(config, function(err) {
    if(err) {
      cb(err);
      return;
    }

    logger.info("initialized mr-issue");
    cb(null);
  });
}

///
/// Parse the Merge Request body for regerenced issue numbers and call the
// callback with the list of Redmine issue descriptors.
///
MrIssueDriver.prototype.parseClosedIssues = function(mergeRequest, cb) {
  var self = this;
  //var matches = mergeRequest.description.match(this.closeIssueRegExp);
  var description = mergeRequest.description;
  var result;
  var issueIds = [];
  var re = /closes\s+#(\d+)\b/gi;

  while((result = re.exec(description)) != null) {
    issueIds.push(result[1]);
  }

  issueIds = _.uniq(issueIds);

  if(issueIds.length > 0) {
    // Retrieve the issue bodies from Redmine
    asyncMapIgnoreErrors(issueIds, self.redmine.queryIssue, cb);
  } else {
    cb(null, []);
  }
};


MrIssueDriver.prototype.processIssue = function(data, cb) {
  // The update issue request body
  var body = {};
  var actions = data.project.actions[data.action];

  if(actions.assigned_to_id) {
    body.assigned_to_id = actions.assigned_to_id;
  } else if(actions.assignedTo) {
    body.assigned_to_id = this.redmine.getUser(actions.assignedTo).id;
  }

  if(actions.status_id) {
    body.status_id = actions.status_id;
  } else if(actions.status) {
    body.status_id = this.redmine.getIssueStatusDescriptor(actions.status).id;
  }

  if(data.action == 'open') {
    body.custom_fields = [
      { id: this.redmine.mergeRequestField.id, value: data.mergeRequest.url }
    ];
    body.notes = "Merge request submitted.";
  } else if(data.action == 'merge') {
    body.notes = "Merge request accepted."
  }

  if(data.project.redmineProjects && data.project.redmineProjects.indexOf(data.issue.project.id) < 0) {
    logger.error("issue #%s is out of project scope", data.issue.id);
    cb(null);
    return;
  }

  this.redmine.updateIssue(data.issue.id, body, data.user.username, cb);
};


///
/// Handle a Merge Request webhook event.
///
MrIssueDriver.prototype.handleWebHook = function(name, body) {
  var self = this;
  var action;
  var mergeRequest = body.object_attributes;
  var project = this.config.getProjectConfig(name);

  if(!project) {
    console.log("Unknown project: " + name);
    return;
  }

  if(mergeRequest.action == 'open') {
    action = 'open';
  } else if(mergeRequest.action == 'merge') {
    action = 'merge';
  } else if(mergeRequest.action == 'close') {
    action = 'close';
  } else {
    console.log("Unknown merge request action: " + mergeRequest.action);
    return;
  }

  this.parseClosedIssues(mergeRequest, function(err, issues) {
    if(err || issues.length == 0) {
      console.log("No closed issues referenced in merge request");
      return;
    }

    async.eachSeries(issues, function(issue, cb) {
      if(!issue) {
        return;
      }

      console.log("Processing issue: " + issue.id);
      self.processIssue({
        project: project,
        mergeRequest: mergeRequest,
        user: body.user,
        issue: issue,
        action: action
      }, cb);
    });
  });
};


module.exports = MrIssueDriver;


////////////////////////////////////////////////////////////////////////////////
