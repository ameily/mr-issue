var request = require('request');


var Redmine = function(config) {
    this.config = config;
    this.statuses = null;
    this.users = {};
    this.projects = {};
    this.mergeRequestField = null;

    this.clearCache = function(config) {
        this.statuses = null;
        this.users = {};
        this.projects = {};
        this.mergeRequestField = null;
    };

    this.getMergeRequestField = function(cb) {
        if(this.mergeRequestField) {
            cb(null, this.mergeRequestField);
        } else {
            //TODO
        }
    };

    this.getUser = function(name, cb) {
        if(name in this.users) {
            cb(null, this.users[name]);
        } else {
            var self = this;

            request.request({
                url: this.config.url + "/users.json",
                method: "GET",
                json: true,
                body: {
                    key: this.config.api_key,
                    name: name
                }
            }, function(err, res, body) {
                if(err) {
                    cb(err);
                } else {
                    //TODO
                }
            });
        }
    };

    this.getStatus = function(name, cb) {
        var key = name.toLowerCase();
        if(this.statuses == null) {
            request.request({
                url: this.config.url + "/issues_statuses.json",
                method: "GET",
                json: true,
                body: {
                    key: this.config.api_key
                }
            }, function(err, res, body) {
                if(err) {
                    cb(err);
                } else {
                    //TODO
                }
            });
        } else {
            if(key in this.statuses) {
                cb(null, this.statuses[key]);
            } else {
                cb("status does not exist");
            }
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
        //TODO
    };
};


