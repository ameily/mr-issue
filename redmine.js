

var request = require('request');
var fs = require('fs');
var util = require('util');
var url = require('url');
var async = require('async');
var _ = require('underscore');


function Redmine(config, cb) {
  this.config = config.redmine;
  //this.statuses = null;
  //this.users = {};
  //this.mergeRequestField = null;
  this.request = null;

  if(this.config.ssl_ca) {
    this.request = request.defaults({
      agentOptions: {
        ca: fs.readFileSync(this.config.ssl_ca)
      },
      json: true
    });
  } else {
    this.request = request.defaults({
      json: true
    });
  }

  this.users = {};
  this.issueStatuses = {};
  this.mergeRequestField = null;

  _.bindAll(this,
    "init", "getUser", "getIssueStatusDescriptor", "queryUser", "checkResponse",
    "queryMergeRequestField", "queryIssueStatusDescriptors", "queryIssue",
    "updateIssue"
  );

  this.init(config, cb);
};


Redmine.prototype.init = function(config, callback) {
  var self = this;

  var userLookup = config.getUserLookups();
  var statusLookup = config.getIssueStatusLookups();

  console.log("Statuses: " + util.inspect(statusLookup));
  console.log("Users: " + util.inspect(userLookup));

  async.series([
    self.queryMergeRequestField,
    self.queryIssueStatusDescriptors,
    function(cb) {
      async.eachSeries(userLookup, self.queryUser, cb);
    },
    function(cb) {
      for(var i in statusLookup) {
        var name = statusLookup[i];
        var status = self.getIssueStatusDescriptor(name);
        if(!status) {
          cb("Issue status not found: " + name);
          return;
        } else {
          console.log("Found status: " + name + " => " + status.id);
        }
      }

      cb(null);
    }
  ], callback);
};

Redmine.prototype.getUser = function(name) {
  return this.users[name];
};

Redmine.prototype.getIssueStatusDescriptor = function(name) {
  var key = name.toLowerCase();
  return this.issueStatuses[key];
};


///
/// Check a Redmine response and properly perform an error callback if the
/// request failed.
///
Redmine.prototype.checkResponse = function(err, res, cb) {
  if(err) {
    cb(err);
    return false;
  } else if(res.statusCode != 200) {
    cb("http error code: " + res.statusCode.toString());
    return false;
  } else {
    return true;
  }
};


///
/// Query Redmine for the Merge Request custom field and cache the result.
///
Redmine.prototype.queryMergeRequestField = function(cb) {
  var self = this;
  console.log("Query Merge request field: " + this.config.apiKey);

  // Query Redmine
  this.request({
    url: url.resolve(this.config.url, "/custom_fields.json"),
    method: "GET",
    body: {
      key: this.config.apiKey
    }
  }, function(err, res, body) {
    if(self.checkResponse(err, res, cb)) {
      // Got a valid response
      for(var i in body.custom_fields) {
        var field = body.custom_fields[i];
        if(field.name.toLowerCase() == "merge request") {
          // Found the Merge Request custom field
          console.log(util.format("Merge request field: %s [%d]", field.name, field.id));
          self.mergeRequestField = field;

          break;
        }
      }

      if(!self.mergeRequestField) {
        console.log("Could not find merge request field");
      }

      cb(null, self.mergeRequestField);
    }
  });
};


///
/// Query the list of issue statuses.
///
/// {
///   id: 1,
///   name: "New",
///   is_closed: false,
///   is_default: true
/// }
///
Redmine.prototype.queryIssueStatusDescriptors = function(cb) {
  var self = this;

  this.request({
    uri: url.resolve(this.config.url, "/issue_statuses.json"),
    method: "GET",
    body: {
      key: this.config.apiKey
    }
  }, function(err, res, body) {
    if(self.checkResponse(err, res, cb)) {
      // Got a valid response, populate the status map
      self.statuses = {};
      _.each(body.issue_statuses, function(status) {
        status.key = status.name.toLowerCase();
        self.issueStatuses[status.key] = status;
        console.log("Issue Status Descriptor: " + status.name + " [" + status.id.toString() + "]");
      });

      cb(null, self.issueStatuses);
    }
  });
};


///
/// Query a Redmine user based on user name or email address and cache the
/// result.
///
/// {
///   login: "jplang",
///   firstname: "Jean-Philippe",
///   lastname: "Lang",
///   mail: "jp_lang@yahoo.fr",
///   password: "secret"
/// }
///
Redmine.prototype.queryUser = function(name, cb) {
  var self = this;

  // Query a specific user
  this.request({
    url: url.resolve(this.config.url, "/users.json"),
    method: "GET",
    body: {
      key: this.config.apiKey,
      name: name
    }
  }, function(err, res, body) {
    var user = null;

    if(self.checkResponse(err, res, cb)) {
      // We got a valid response
      if(body.total_count == 0) {
        // No user found
        console.log("User does not exist: " + name);
        cb("User does not exist: " + name);
      } else {
        // User found
        user = body.users[0]
        console.log(util.format(
          "Found user: %s => %s %s [%d]", name, user.firstname, user.lastname,
           user.id
        ));
        self.users[name] = user;

        cb(null, user);
      }
    }
  });
};



///
/// Query the a Redmine issue.
///
/*
<id>4326</id>
<project name="Redmine" id="1"/>
<tracker name="Feature" id="2"/>
<status name="New" id="1"/>
<priority name="Normal" id="4"/>
<author name="John Smith" id="10106"/>
<category name="Email notifications" id="9"/>
<subject>
  Aggregate Multiple Issue Changes for Email Notifications
</subject>
<description>
  This is not to be confused with another useful proposed feature that
  would do digest emails for notifications.
</description>
<start_date>2009-12-03</start_date>
<due_date></due_date>
<done_ratio>0</done_ratio>
<estimated_hours></estimated_hours>
<custom_fields>
  <custom_field name="Resolution" id="2">Duplicate</custom_field>
  <custom_field name="Texte" id="5">Test</custom_field>
  <custom_field name="Boolean" id="6">1</custom_field>
  <custom_field name="Date" id="7">2010-01-12</custom_field>
</custom_fields>
<created_on>Thu Dec 03 15:02:12 +0100 2009</created_on>
<updated_on>Sun Jan 03 12:08:41 +0100 2010</updated_on>
*/
Redmine.prototype.queryIssue = function(id, cb) {
  var self = this;
  console.log("Query Issue: " + id);

  this.request({
    url: url.resolve(this.config.url , "/issues/" + id + ".json"),
    method: "GET",
    body: {
      key: this.config.apiKey
    }
  }, function(err, res, body) {
    if(self.checkResponse(err, res, cb)) {
      cb(null, body ? body.issue : null );
    }
  });
};


///
/// Update an issue on Redmine.
///
/// @param body an object corresponding to the fields to update
/// @param impersonate the user name to impersonate
///
Redmine.prototype.updateIssue = function(id, body, impersonate, cb) {
  var self = this;
  var req = {
    url: url.resolve(this.config.url , "/issues/" + id + ".json"),
    method: "PUT",
    body: {
      issue: body,
      key: this.config.apiKey
    }
  };

  if(this.config.impersonate && impersonate) {
    req.headers = {
      "X-Redmine-Switch-User": impersonate
    };
  }

  this.request(req, function(err, res, body) {
    if(self.checkResponse(err, res, cb)) {
      console.log("Update? " + util.inspect(body));
      cb(null);
    }
  });
};


module.exports = Redmine;



////////////////////////////////////////////////////////////////////////////////
