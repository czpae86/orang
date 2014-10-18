/**
 * Created by caizhiping on 14-10-15.
 */

(function(){
    var fs = require("fs"),
        path = require("path");

    var CONTENT_TYPE = require("./contentType"),
        TOSTRING = Object.prototype.toString;

    function isObject(v){
        return v!=null&&TOSTRING.call(v) == '[object Object]';
    }

    function isArray(v){
        return TOSTRING.call(v) == '[object Array]';
    }

    function isNumber(v){
        return TOSTRING.call(v) == '[object Number]';
    }

    function isString(v){
        return TOSTRING.call(v) == '[object String]';
    }

    function isFunction(v){
        return TOSTRING.call(v) == '[object Function]';
    }

    function isDate(v){
        return TOSTRING.call(v) == '[object Date]';
    }

    function isEmpty(v){
        if (v==null){
            return true;
        }else if(isString(v)){
            return v.length>0 ? false : true;
        }else{
            return !v;
        }
    }

    function return404(res){
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end();
    }

    function return400(res){
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end();
    }

    function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    };

    function sendFile(res,pathname){
        if(isEmpty(pathname)){
            return return404(res);
        }
        fs.readFile(pathname, function (err, file) {
            if (err) {
                //console.log(err);
                return return400(res);
            };
            var type = CONTENT_TYPE[path.extname(pathname).toLowerCase()];
            res.writeHead(200, {'Content-Type': (type?type:'text/plain')});
            res.write(file,"binary");
            res.end();
        });
    }

    module.exports.isObject = isObject;
    module.exports.isNumber = isNumber;
    module.exports.isString = isString;
    module.exports.isArray = isArray;
    module.exports.isFunction = isFunction;
    module.exports.isEmpty = isEmpty;
    module.exports.isDate = isDate;
    module.exports.return404 = return404;
    module.exports.return400 = return400;
    module.exports.getClientIp = getClientIp;
    module.exports.sendFile = sendFile;
})();

