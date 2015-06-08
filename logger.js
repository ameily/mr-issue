var winston = require('winston');
var util = require('util');
var moment = require('moment');
//var colors = require('colors/safe');

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


        //var c = opt.level in colorMap ? colorMap(opts.level) : function(s) { return s; };

        return util.format("[%s] %s %s", opts.timestamp(), opts.level, opts.message);
      }
    })
  ]
});

module.exports = logger;
