/**
 * Created by caizhiping on 14-10-15.
 */

(function(){
    var fs = require("fs"),
        zlib = require("zlib"),
        path = require("path");

    var mime = require("./mime"),
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
        res.writeHead(404, {'Content-Type': mime['']});
        res.end();
    }

    function return400(res){
        res.writeHead(400, {'Content-Type': mime['']});
        res.end();
    }

    function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    };

    function applyif(o,k){
        if(isObject(o)&&isObject(k)){
            for(var f in k){
                if(k[f]){
                    o[f] = k[f];
                }
            }
        }
        return o||{};
    }

    var maxAge = 60*60*1000,
        compress = {
            match: /css|js|html/ig
        };

    function sendFile(req,res,realPath){
        if(isEmpty(realPath)){
            return return404(res);
        }
        fs.stat(realPath,function(err, stats){
            if (err) {
                return return404(res);
            }

            zipResponse(req,res,stats,realPath);
        });
    }

    function getTime(){
        return new Date().getTimeout();
    }

    function zipResponse(req,res,stats,realPath){
        if(!stats){
            return return400(res);
        }
        //var startTime = getTime();
        var lastModified = stats.mtime.toUTCString();
        var ifModifiedSince = "If-Modified-Since".toLowerCase();
        var extname = path.extname(realPath).toLowerCase();
        if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince].split(";")[0]) {
            res.writeHead(304, "Not Modified");
            res.end();
        } else {
            var expires = new Date();
            expires.setTime(expires.getTime() + maxAge);
            var headers = {
                "Expires":expires.toUTCString(),
                "Cache-Control":"max-age=" + maxAge,
                "Last-Modified" : lastModified,
                "Content-Type": (mime[extname]?mime[extname]:mime[''])
            };
            var raw = fs.createReadStream(realPath);
            var acceptEncoding = req.headers['accept-encoding'] || "";
            var matched = extname.match(compress.match);
            if (matched && acceptEncoding.match(/\bgzip\b/)) {
                res.writeHead(200, applyif(headers,{'Content-Encoding': 'gzip'}));
                raw.pipe(zlib.createGzip()).pipe(res);
            } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
                res.writeHead(200, applyif(headers,{'Content-Encoding': 'deflate'}));
                raw.pipe(zlib.createDeflate()).pipe(res);
            } else {
                res.writeHead(200, headers);
                raw.pipe(res);
            }
        }
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
    module.exports.applyif = applyif;
    module.exports.zipResponse = zipResponse;
})();

