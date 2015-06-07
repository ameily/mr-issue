

var request = require('request');
var fs = require('fs');
var util = require('util');
var url = require('url');
var async = require('async');


function Redmine(config) {
  this.config = config;
  //this.statuses = null;
  //this.users = {};
  //this.mergeRequestField = null;
  this.request = null;

  if(config.ssl_ca) {
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
};

Redmine.prototype.init = function(cb) {
  var self = this;
  this.clearCache();

  async.series([
    this.getMergeRequestField,
    this.getIssueStatusDescriptors
  ], cb);
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
this.getMergeRequestField = function(cb) {
  var self = this;

  var ret = function() {
    // Perform a callback based on the current merge request field.
    if(self.mergeRequestField) {
      logger.error("Could not find merge request field");
      cb(null, self.mergeRequestField);
    } else {
      cb("merge request field does not exist");
    }
  };

  if(this.mergeRequestField) {
    ret();
  } else {
    var self = this;

    // Query Redmine
    this.request({
      url: url.resolve(this.config.url, "/custom_fields.json"),
      method: "GET",
      body: {
        key: this.config.api_key
      }
    }, function(err, res, body) {
      if(self.checkResponse(err, res, cb)) {
        // Got a valid response
        for(var i in body.custom_fields) {
          var field = body.custom_fields[i];
          if(field.name.toLowerCase() == "merge request") {
            // Found the Merge Request custom field
            logger.debug(util.format("Merge request field: %s [%d]", field.name, field.id);
            self.mergeRequestField = field;
            break;
          }
        }
        ret();
      }
    });
  }
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
this.getUser = function(name, cb) {
  if(name in this.users) {
    cb(null, this.users[name]);
  } else {
    var self = this;

    // Query a specific user
    this.request({
      url: url.resolve(this.config.url, "/users.json"),
      method: "GET",
      body: {
        key: this.config.api_key,
        name: name
      }
    }, function(err, res, body) {
      if(self.checkResponse(err, res, cb)) {
        // We got a valid response
        if(body.total_count == 0) {
          // No user found
          logger.error("User does not exist: " + name);
          cb("User does not exist");
        } else {
          // User found
          var user = body.users[0].
          logger.info(util.format(
            "Found user: %s => %s %s [%d]", name, user.firstname, user.lastname,
             user.id
          ));
          self.users[name] = user;
          cb(null, user);
        }
      }
    });
  }
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
Redmine.prototype.getIssueStatusDescriptors = function(cb) {
  var self = this;

  this.request({
    uri: url.resolve(this.config.url, "/issue_statuses.json"),
    method: "GET",
    body: {
      key: this.config.api_key
    }
  }, function(err, res, body) {
    if(self.checkResponse(err, res, cb)) {
      // Got a valid response, populate the status map
      self.statuses = {};
      _.each(body.issue_statuses, function(status) {
        status.key = status.name.toLowerCase();
        self.statuses[status.key] = status;
      });

      cb(null, self.statuses);
    }
  });
};

///
/// Get the issue status descriptor.
///
/// @param name the status name to query
///
Redmine.prototype.getIssueStatusDescriptor = function(name, cb) {
  var key = name.toLowerCase();
  var self = this;

  var ret = function() {
    if(key in self.statuses) {
      cb(null, self.statuses[key]);
    } else {
      logger.error("Status does not exist");
      cb("status does not exist");
    }
  };

  if(this.statuses == null) {
    // Query redmine for the list of statuses
    this.queryIssueStatuses(ret);
  } else {
    // Statuses are already populated
    ret();
  }
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
Redmine.prototype.getIssue = function(id, cb) {
  var self = this;

  this.request({
    url: url.resolve(this.config.url , "/issue/" + id + ".json"),
    method: "GET",
    body: {
      key: this.config.api_key
    }
  }, function(err, res, body) {
    if(self.checkResponse(err, res, cb)) {
      cb(null, body);
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
  var req = {
    url: url.resolve(this.config.url , "/issue/" + id + ".json"),
    method: "PUT",
    body: _.defaults({}, body, {key: this.config.api_key})
  };

  if(impersonate) {
    req.headers = {
      "X-Redmine-Switch-User": impersonate
    };
  }

  this.request(req, function(err, res, body) {
    if(this.checkResponse(err, res, cb)) {

    }
  });
};


module.exports = Redmine;
