/**
 * Created by caizhiping on 14-10-15.
 */
(function(){
    var tools = require("./tools"),
        http = require("http"),
        https = require("https"),
        url = require("url"),
        domain = require("domain"),
        path = require("path"),
        fs = require("fs"),
        querystring = require("querystring");


    var root = this,
        orang = {},
        serverConfig = {
            serverType : "http",
            port : 80,
            handlerMapping : {},
            handlerMethodMapping : {},
            key: null,
            cert: null
        },
        staticResourcePath = [],
        staticResourceExtName = [".js",".css",".png",".gif",".ioc",".jpg",".jpeg"];

    orang.initConfig = function(opts){
        if(tools.isObject(opts)){
            serverConfig.serverType = tools.isEmpty(opts.serverType)?serverConfig.serverType:opts.serverType;
            serverConfig.port = tools.isNumber(opts.port)?opts.port:serverConfig.port;
            serverConfig.key = opts.key;
            serverConfig.cert = opts.cert;
            staticResourcePath = opts.staticResourcePath||[];
        }

        root.server = (function(){
            root._domain = domain.create();
            root._domain.on("error", function(err) {
                console.error("error", err.stack);
            });
            var server;
            if(serverConfig.serverType.toLowerCase() == "http"){
                server = http.createServer(handler);
            }else if(serverConfig.serverType.toLowerCase() == "https"){
                server = https.createServer({
                    key: serverConfig.key,
                    cert: serverConfig.cert
                },handler);
            }else{
                console.warn("only support http and https");
            }
            return server;
        })();
    }

    orang.start = function(){
        root.server.listen(serverConfig.port,function(err){
            if(err){
                console.error(err);
                return;
            }

            console.log("orang server has started,listen on :%d",serverConfig.port);
        });
    }

    orang.handlerMapping = function(mapping){
        //[{action:"/upload",handler:"Function",method:["POST","GET"]}]
        if(tools.isArray(mapping)){
            mapping.forEach(function(o){
                if(!tools.isEmpty(o.action)&&!tools.isEmpty(o.handler)){
                    serverConfig.handlerMapping[o.action] = o.handler;
                    serverConfig.handlerMethodMapping[o.action] = tools.isEmpty(o.method)?["GET"]:tools.isArray(o.method)? o.method:[o.method];
                }
            });
        }else if(tools.isObject(mapping)){
            serverConfig.handlerMapping[mapping.action] = mapping.handler;
            serverConfig.handlerMethodMapping[mapping.action] = tools.isEmpty(mapping.method)?["GET"]:tools.isArray(mapping.method)? mapping.method:[mapping.method];
        }else{
            console.warn("handlerMapping::value is not an object/array");
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
        var methodArr = serverConfig.handlerMethodMapping[pathname];
        for(var i= 0,len=methodArr.length;i<len;i++){
            if(methodArr[i].toUpperCase()==method.toUpperCase()){
                return true;
            }
        }
        return false;
    }

    function filter(req,res){
        var pathname = url.parse(req.url).pathname;

        if(pathname.indexOf("/favicon.ico")!=-1){
            return tools.return404(res);
        }
        var method = req.method;
        console.log("action="+pathname+" ,method="+method+" ,clientId="+tools.getClientIp(req));
        var extname = path.extname(pathname).toLowerCase();
        if(staticResourceExtName.indexOf(extname)!=-1){
            var len = staticResourcePath.length;
            if(len<=0){
                return tools.return404(res);
            }else{
                staticResourcePath = tools.isArray(staticResourcePath)?staticResourcePath:[staticResourcePath];
                for(var i=0;i<len;i++){
                    var newPath = path.join(staticResourcePath[i],pathname);
                    var exists = fs.existsSync(newPath);
                    if(exists){
                        return tools.sendFile(res,newPath);
                    }else if((i+1)==len){
                        break;
                    }
                }
            }
        }else{
            var action = serverConfig.handlerMapping[pathname];
            if(tools.isFunction(action)){
                if(checkMethod(pathname,method)){
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
                    console.warn("req "+pathname+" is not support "+method);
                    return tools.return400(res);
                }
            }else{
                return tools.return404(res);
            }
        }
    }

    module.exports = orang;
})();