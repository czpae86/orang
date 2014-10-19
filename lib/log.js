/**
 * Created by caizhiping on 14-10-18.
 */
var tools = require("./tools"),
    util = require('util');

module.exports = LOG;
var n;
function LOG(level){
    n = level ? (n = LEVEL.indexOf(level.toString().toUpperCase()))==-1?0:n:0;
};

var DATE_FORMAT = "%d-%d-%d %d:%d:%d.%d",
    LOG_FORMAT = "[%s] [%s] %s",
    LEVEL = ["DEBUG","INFO","WARN","ERROR"],
    PRINT = function(type,msg){
        var index = LEVEL.indexOf(type);
        if(!tools.isEmpty(msg)&&index >=n){
            console.log(util.format(LOG_FORMAT, formatDate(new Date()), type, msg));
        }
    };

LOG.prototype.debug = function(msg){
    PRINT(LEVEL[0],msg);
}

LOG.prototype.info = function(msg){
    PRINT(LEVEL[1],msg);
}


LOG.prototype.warn = function(msg){
    PRINT(LEVEL[2],msg);
}

LOG.prototype.error = function(msg){
    PRINT(LEVEL[3],msg);
}

function formatDate(d){
    if(!tools.isDate(d)){
        d = new Date();
    }
    var year = d.getFullYear(),
        month = d.getMonth() + 1,
        date = d.getDate(),
        hours = d.getHours(),
        minutes = d.getMinutes(),
        seconds = d.getSeconds(),
        milliseconds = d.getMilliseconds();
    return util.format(DATE_FORMAT, year,month,date,hours,minutes,seconds,milliseconds);
}