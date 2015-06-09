var winston = require('winston');
var util = require('util');
var moment = require('moment');
var colors = require('colors/safe');

var colorMap = {
  info: colors.green,
  warn: colors.yellow,
  error: colors.red,
  debug: colors.cyan
};

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: "debug",
      colorize: true,
      //timestamp: true,
      showLevel: true,



      timestamp: function() {
        return moment().format("HH:mm:ss");
      },

      formatter: function(opts) {
        var c = colorMap[opts.level].bold || function(s) { return s; };

        return util.format(
          "[%s] %s %s", colors.grey.bold(opts.timestamp()),
          c(opts.level.toUpperCase()), opts.message
        );
      }
    })
  ]
});

module.exports = logger;
