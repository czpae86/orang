/**
 * Created by caizhiping on 14-10-15.
 */
(function(){
    var tools = require("./tools"),
        LOG = require("./log"),
        http = require("http"),
        https = require("https"),
        url = require("url"),
        domain = require("domain"),
        path = require("path"),
        fs = require("fs"),
        querystring = require("querystring");


    var orang = {},
        root = this,
        fileExtName = [".js",".css",".png",".gif",".ioc",".jpg",".jpeg"],
        handlerMapping = {},
        handlerMethodMapping = {},
        config = {
            protocolType : "http",
            port : 80,
            logLevel : "INFO",            
            staticResource : [],
            key: null,
            cert: null
        };

    function applyif(o,k){
        if(tools.isObject(o)&&tools.isObject(k)){
            for(var f in k){
                if(k[f]){
                    o[f] = k[f];
                }
            }
        }
    }

    orang.initConfig = function(opts){
        applyif(config,opts);
        LOG = new LOG(config.logLevel);
        root.server = (function(){
            var server;
            root._domain = domain.create();
            root._domain.on("error", function(err) {
                LOG.error(err.stack);
            });
            if(config.protocolType.toLowerCase() == "http"){
                server = http.createServer(handler);
            }else if(config.protocolType.toLowerCase() == "https"){
                server = https.createServer({
                    key: config.key,
                    cert: config.cert
                },handler);
            }else{
                LOG.warn("only support http and https");
            }
            return server;
        })();
    }

    orang.start = function(callback){
        root.server.listen(config.port,function(err){
            if(err){
                LOG.error(err.stack);
                return;
            }

            LOG.info("orang server has started,listen on :"+config.port);

            !tools.isFunction(callback) || callback();
        });
    }

    orang.handlerMapping = function(mapping){
        if(tools.isArray(mapping)){
            mapping.forEach(function(o){
                if(!tools.isEmpty(o.action)&&!tools.isEmpty(o.handler)){
                    handlerMapping[o.action] = o.handler;
                    handlerMethodMapping[o.action] = tools.isEmpty(o.method)?["GET"]:
                        (tools.isArray(o.method)? o.method:[o.method]);
                }
            });
        }else if(tools.isObject(mapping)){
            handlerMapping[mapping.action] = mapping.handler;
            handlerMethodMapping[mapping.action] = tools.isEmpty(mapping.method)?["GET"]:
                (tools.isArray(mapping.method)? mapping.method:[mapping.method]);
        }else{
            LOG.warn("handlerMapping::value is not an object/array");
        }
    }

    function handler(req,res){
        root._domain.add(req);
        root._domain.add(res);
        root._domain.run(function() {
            filter(req,res);
        });
    }

    function checkMethod(pathname,method){
        var methodArr = handlerMethodMapping[pathname];
        for(var i= 0,len=methodArr.length;i<len;i++){
            if(methodArr[i].toUpperCase()==method.toUpperCase()){
                return true;
            }
        }
        return false;
    }

    function filter(req,res){
        var startTime = new Date().getTime();
        var pathname = url.parse(req.url).pathname;
        if(pathname.indexOf("/favicon.ico")!=-1){
            return tools.return404(res);
        }
        var method = req.method;
        var extname = path.extname(pathname).toLowerCase();
        if(fileExtName.indexOf(extname)!=-1){
            var len = config.staticResource.length;
            if(len<=0){
                return tools.return404(res);
            }else{
                config.staticResource = tools.isArray(config.staticResource)?config.staticResource:[config.staticResource];
                for(var i=0;i<len;i++){
                    var newPath = path.join(config.staticResource[i],pathname);
                    var exists = fs.existsSync(newPath);
                    if(exists){
                        return tools.sendFile(res,newPath,function(){
                            LOG.debug("action="+pathname+" ,method="+method+" ,clientId="+tools.getClientIp(req)+" ("+(new Date().getTime()-startTime)+"ms)");
                        });
                    }else if((i+1)==len){
                        break;
                    }
                }
            }
        }else{
            var action = handlerMapping[pathname];
            if(tools.isFunction(action)){
                if(checkMethod(pathname,method)){
                    LOG.info("action="+pathname+" ,method="+method+" ,clientId="+tools.getClientIp(req));
                    var params="";
                    if(method.toUpperCase()=="GET"){
                        params = url.parse(req.url,true).query;
                        action(req,res,params);
                    }else if(method.toUpperCase()=="POST"){
                        req.on("data",function(chunk){
                            params +=chunk;
                        });
                        req.on("end",function(){
                            params = querystring.parse(params.toString());
                            action(req,res,params);
                        });
                    }else{
                        action(req,res);
                    }
                }else{
                    LOG.warn("req "+pathname+" is not support "+method);
                    return tools.return400(res);
                }
            }else{
                return tools.return404(res);
            }
        }
    }

    module.exports = orang;
})();