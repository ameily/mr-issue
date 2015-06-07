
var Redming = require('./redmine');
var _ = require('underscore');
var async = require('async');
var logger = require('./logger');


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
  this.redmine = new Redmine(config.redmine);
  this.closeIssueRegExp = /closes\s+#(\d+)\b/gi;

  this.redmine.init(cb);
}

///
/// Parse the Merge Request body for regerenced issue numbers and call the
// callback with the list of Redmine issue descriptors.
///
MrIssueDriver.prototype.parseClosedIssues = function(mergeRequest, cb) {
  var issues = mergeRequest.description.match(this.closeIssueRegExp);
  if(!issues || issues.length == 0) {
    return [];
  }

  var issueIds = _.uniq(issues);
  if(issueIds.length > 0) {
    // Retrieve the issue bodies from Redmine
    asyncMapIgnoreErrors(issueIds, this.redmine.getIssue, cb);
  } else {
    cb(null, []);
  }
};

///
/// Retrieve the Mr. Issue project configuration for a specific project.
///
MrIssueDriver.prototype.getProjectConfig = function(name) {
  for(var i in this.config.projects) {
    var proj = this.config.projects[i];
    if(proj.name == name) {
      return proj;
    }
  }
  return null;
};

///
/// Based on a Merge Request event, generate the issue update body object to
/// send to Redmine.
///
MrIssueDriver.prototype.getUpdateIssueBody = function(opts, cb) {
  var proj = this.getProjectConfig(opts.name);
  if(!proj || !proj[opts.hook]) {
    cb(null, {});
  }

  var body = {};
  var hooks = proj[opts.hook];
  async.series({
    assignee: function(cb) {
      if(hooks.assignee) {
        self.redmine.getUser(hooks.assignee, cb);
      } else {
        cb(null, null);
      }
    },
    status: function(cb) {
      if(hooks.status) {
        self.redmine.getStatus(hooks.status, cb);
      } else {
        cb(null, null);
      }
    },
    mergeRequestField: function(cb) {
      if(opts.hook == 'open') {
        self.redmine.getMergeRequestField(cb);
      } else {
        cb(null, null);
      }
    }
  }, function(err, data) {
    if(err) {
      cb(err);
      return;
    }

    var body = {};
    if(data.status) {
      body.status_id = data.status.id;
    }

    if(props.assignee) {
      body.assigned_to_id = data.assignee.id;
    }

    if(opts.field) {
      body.custom_fields = [{
        id: opts.field.id,
        value: opts.req.object_attributes.url
      }];
    }

    cb(null, body);
  });
};

///
/// Handle a Merge Request webhook event.
///
MrIssueDriver.prototype.handleMergeRequestEvent = function(name, req) {
  var self = this;
  var hook;
  var mergeRequest = req.object_attributes;

  if(mergeRequest.action == 'open') {
    hook = 'open';
  } else if(mergeRequest.action == 'merge') {
    hook = 'merge';
  } else if(mergeRequest.action == 'close') {
    hook = 'close';
  } else {
    return;
  }

  this.parseClosedIssues(mergeRequest, function(err, issues) {
    if(err || issues.length == 0) {
      logger.info("No closed issues referenced in merge request");
      return;
    }

    async.eachSeries(issues, function(issue) {
      self.updateIssue()
    });
  });

  if(issues.length == 0) {
    return;
  }

  this.redmine.getMergeRequestField(function(err, field) {
    if(err) {
      //TODO
      return
    }

    self.getUpdateIssueBody({
      name: name,
      hook: hook,
      field: field,
      req: req
    }, function(err, body) {
      if(err) {
        return;
      }

      var impersonate = null;
      if(self.config.redmine.impersonate && req.user.username) {
        impersonate = req.user.username;
      }

      _.each(issues, function(issue) {
        self.redmine.updateIssue(issue, body, impersonate, function(err) {
          //TODO
        });
      });
    });
  });
};


module.exports = MrIssueDriver;
