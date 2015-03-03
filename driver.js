
var Redming = require('./redmine');
var _ = require('underscore');
var async = require('async');

function MrIssueDriver(config, cb) {
    this.config = config;
    this.redmine = new Redmine(config.redmine);
    this.closeIssueRegExp = /closes\s+#(\d+)\b/gi;

    this.init = function() {
        var self = this;
        this.redmine.getMergeRequestField(function(err, field) {
            if(err) {
                cb(err);
            } else {
                cb();
            }
        });
    };

    this.getIssues = function(req) {
        var issues = req.object_attributes.description.match(this.closeIssueRegExp);
        if(!issues || issues.length == 0) {
            return [];
        }

        return _.uniq(issues);
    };

    this.getProject = function(name) {
        for(var i in this.config.projects) {
            var proj = this.config.projects[i];
            if(proj.name == name) {
                return proj;
            }
        }
        return null;
    };

    this.getUpdateIssueBody= function(opts, cb) {
        var proj = this.getProject(opts.name);
        if(proj && proj[opts.hook]) {
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
                }
            }, function(err, data) {
                if(err) {
                    cb(err);
                } else {
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
                }
            });

        } else {
            return cb(null, {});
        }
    };

    this.handleMergeRequestEvent = function(name, req) {
        var self = this;
        var hook;

        if(req.object_attributes.action == 'open') {
            hook = 'open';
        } else if(req.object_attributes.action == 'merge') {
            hook = 'merge';
        } else if(req.object_attributes.action == 'close') {
            hook = 'close';
        } else {
            return;
        }

        var issues = this.getIssues(req);

        if(issues.length == 0) {
            return;
        }

        this.redmine.getMergeRequestField(function(err, field) {
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
};

module.exports = MrIssueDriver;


