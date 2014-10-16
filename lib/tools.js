/**
 * Created by caizhiping on 14-10-15.
 */

(function(){
    var TOSTRING = Object.prototype.toString;
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

    function isEmpty(v){
        if (v==null){
            return true;
        }else if(isString(v)){
            return v.length>0 ? false : true;
        }else{
            return !v;
        }
    }

    function return404(response){
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end();
    }

    function return400(response){
        response.writeHead(400, {'Content-Type': 'text/plain'});
        response.end();
    }

    module.exports.isObject = isObject;
    module.exports.isNumber = isNumber;
    module.exports.isString = isString;
    module.exports.isArray = isArray;
    module.exports.isFunction = isFunction;
    module.exports.isEmpty = isEmpty;

    module.exports.return404 = return404;
    module.exports.return400 = return400;
})();

