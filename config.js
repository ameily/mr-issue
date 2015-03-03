
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
        name: name,
        open: open,
        merge: merge,
        close: close
    };

    return obj;
}

function getBool(val) {
    if(_.isUndefined(val)) {
        return false;
    } else if(_.isString(val)) {
        return _.indexOf(
            ['y', 'yes', 't', 'true', '1', 'on'],
            val.toLowerCase()
        ) >= 0;
    } else if(_.isNumber(val)) {
        return val > 0;
    }

    return false;
}


function loadConfig(path) {
    var data = yaml.load(path);

    var config = {
        redmine: data.redmine,
        projects: []
    };

    config.redmine.impersonate = getBool(config.redmine.impersonate);

    _.each(data.projects, function(name) {
        var projData = data[name];
        config.projects.push(normalizeProjectConfig(name, projData, data.redmine));
    });

    return config;
}


module.exports = loadConfig;




