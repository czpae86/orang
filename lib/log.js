/**
 * Created by caizhiping on 14-10-18.
 */
var tools = require("./tools"),
    util = require('util');

module.exports = LOG;
var n;
function LOG(level){
    this.level = level ? (n = LEVEL.indexOf(level.toString().toUpperCase()))==-1?0:n:0;
};

var DATE_FORMAT = "%d-%d-%d %d:%d:%d.%d",
    LOG_FORMAT = "[%s] [%s] %s",
    LEVEL = ["DEBUG","INFO","WARN","ERROR"],
    PRINT = function(type,msg){
        if(!tools.isEmpty(msg)){
            console.log(util.format(LOG_FORMAT,formatDate(new Date()),type,msg));
        }
    };

LOG.prototype.debug = function(msg){
    var level = LEVEL[0];
    var index = LEVEL.indexOf(level);
    if( index >=this.level ){
        PRINT(level,msg);
    }
}

LOG.prototype.info = function(msg){
    var level = LEVEL[1];
    var index = LEVEL.indexOf(level);
    if( index >=this.level ){
        PRINT(level,msg);
    }
}


LOG.prototype.warn = function(msg){
    var level = LEVEL[2];
    var index = LEVEL.indexOf(level);
    if( index >=this.level ){
        PRINT(level,msg);
    }
}

LOG.prototype.error = function(msg){
    var level = LEVEL[3];
    var index = LEVEL.indexOf(level);
    if( index >=this.level ){
        PRINT(level,msg);
    }
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