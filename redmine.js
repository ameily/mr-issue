var request = require('request');
var fs = require('fs');
var util = require('util');
var url = require('url');


function Redmine(config) {
    this.config = config;
    this.statuses = null;
    this.users = {};
    this.projects = {};
    this.mergeRequestField = null;
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

    this.clearCache = function(config) {
        this.statuses = null;
        this.users = {};
        this.projects = {};
        this.mergeRequestField = null;
    };

    this.checkResponse = function(err, res, cb) {
        if(err) {
            cb(err);
            return false;
        } else if(res.statusCode != 200) {
            cb("http error code " + res.statusCode.toString());
            return false;
        } else {
            return true;
        }
    };

    this.getMergeRequestField = function(cb) {
        var self = this;

        var ret = function() {
            if(self.mergeRequestField) {
                cb(null, self.mergeRequestField);
            } else {
                cb("merge request field does not exist");
            }
        };

        if(this.mergeRequestField) {
            ret();
        } else {
            var self = this;

            this.request({
                url: url.resolve(this.config.url, "/custom_fields.json"),
                method: "GET",
                body: {
                    key: this.config.api_key
                }
            }, function(err, res, body) {
                if(self.checkResponse(err, res, cb)) {
                    for(var i in body.custom_fields) {
                        var field = body.custom_fields[i];
                        if(field.name.toLowerCase() == "merge request") {
                            self.mergeRequestField = field;
                            break;
                        }
                    }
                    ret();
                }
            });
        }
    };

    this.getUser = function(name, cb) {
        if(name in this.users) {
            cb(null, this.users[name]);
        } else {
            var self = this;

            this.request({
                url: url.resolve(this.config.url, "/users.json"),
                method: "GET",
                body: {
                    key: this.config.api_key,
                    name: name
                }
            }, function(err, res, body) {
                if(self.checkResponse(err, res, cb)) {
                    if(body.total_count == 0) {
                        cb("user does not exist");
                    } else {
                        self.users[name] = body.users[0];
                        cb(null, body.users[0]);
                    }
                }
            });
        }
    };

    this.getStatus = function(name, cb) {
        var key = name.toLowerCase();
        var self = this;

        var ret = function() {
            if(key in self.statuses) {
                cb(null, self.statuses[key]);
            } else {
                console.log(self.statuses);
                cb("status does not exist");
            }
        };

        if(this.statuses == null) {
            this.request({
                uri: url.resolve(this.config.url, "/issue_statuses.json"),
                method: "GET",
                body: {
                    key: this.config.api_key
                }
            }, function(err, res, body) {
                if(self.checkResponse(err, res, cb)) {
                    self.statuses = {};
                    for(var i in body.issue_statuses) {
                        var status = body.issue_statuses[i];
                        status.key = status.name.toLowerCase();
                        self.statuses[status.key] = status;
                    }
                    ret();
                }
            });
        } else {
            ret();
        }
    };

    this.getRedmineProject = function(name, cb) {
        if(name in this.projects) {
            cb(null, this.projects[name]);
        } else {
            //TODO
        }
    };

    this.updateIssue = function(id, body, impersonate) {
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
};

module.exports = Redmine;
