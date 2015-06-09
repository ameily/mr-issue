///
/// @copyright 2015 Adam Meily <meily.adam@gmail.com>
///

var winston = require('winston');
var util = require('util');
var moment = require('moment');
var colors = require('colors/safe');
var fs = require('fs');
var _ = require('underscore');


var colorMap = {
  info: colors.green,
  warn: colors.yellow,
  error: colors.red,
  debug: colors.cyan
};

function getLevelString(level) {
  if(level == "info") {
    return "INFO ";
  } else if(level == "warn") {
    return "WARN ";
  }
  return level.toUpperCase();
}

try {
  var stats = fs.statSync("./log");
} catch(e) {
  fs.mkdirSync("./log");
}


var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: "debug",
      colorize: true,
      showLevel: true,

      timestamp: function() {
        return moment().format("HH:mm:ss");
      },

      formatter: function(opts) {
        var c = colorMap[opts.level].bold || function(s) { return s; };

        var log = util.format(
          "[%s] %s %s", colors.grey.bold(opts.timestamp()),
          c(getLevelString(opts.level)), opts.message
        );

        if(_.isObject(opts.meta) && !_.isEmpty(opts.meta)) {
          log += "\n" + util.inspect(opts.meta);
        }

        return log;
      },

      handleExceptions: true
    }),

    new winston.transports.DailyRotateFile({
      filename: "./log/app.log",
      level: "debug",
      tailable: true,
      json: true,

      timestamp: function() {
        return moment().format("HH:mm:ss");
      },

      /*
      formatters: function(opts) {
        return util.format(
          "[%s] %s %s", opts.timestamp(),
          getLevelString(opts.level), opts.message
        );
      },
      */

      handleExceptions: true
    })
  ]
});


module.exports = logger;
