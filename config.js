
var yaml = require('yamljs');
var _ = require('underscore');


var HookDefaults = {
    assignee: null,
    status: null,
};


function normalizeProjectConfig(name, cfg, globals) {
    var open = _.defaults(cfg.open || {}, globals.open || {}, HookDefaults);
    var close = _.defaults(cfg.close || {}, globals.close || {}, HookDefaults);
    var merge = _.defaults(cfg.merge || {}, globals.merge || {}, HookDefaults);

    var obj = {
        open: open,
        merge: merge,
        close: close
    };

    return obj;
}


function loadConfig(path) {
    var data = yaml.load(path);

    var config = {
        redmine: data.redmine,
        projects: []
    };

    _.each(data.projects, function(name) {
        var projData = data[name];
        config.projects.push(normalizeProjectConfig(name, projData, data.redmine));
    });

    return config;
}


module.exports = loadConfig;




