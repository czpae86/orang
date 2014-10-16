/**
 * Created by caizhiping on 14-10-15.
 */
(function(){
    var tools = require('./tools'),
        http = require('http'),
        https = require('https'),
        url = require('url'),
        domain = require('domain');


    var orang = {};

    var serverConfig = {
        serverType : 'http',
        port : 80,
        handlerMapping : {},
        handlerMethodMapping : {},
        key: null,
        cert: null
    }

    var root = this;

    orang.initConfig = function(opts){
        if(tools.isObject(opts)){
            serverConfig.serverType = tools.isEmpty(opts.serverType)?serverConfig.serverType:opts.serverType;
            serverConfig.port = tools.isNumber(opts.port)?opts.port:serverConfig.port;
            serverConfig.key = opts.key;
            serverConfig.cert = opts.cert;
        }

        root.server = (function(){
            root._domain = domain.create();
            root._domain.on('error', function(err) {
                console.error('error', err.stack);
            });
            var server;
            if(serverConfig.serverType == 'http'){
                server = http.createServer(handler);
            }else {
                server = https.createServer({
                    key: serverConfig.key,
                    cert: serverConfig.cert
                },handler);
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

            console.log("orang server is started,listen on :%d",serverConfig.port);
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
            console.warn("handlerMapping::value is not an object/array.");
        }
    }

    function handler(request,response){
        root._domain.add(request);
        root._domain.add(response);

        var pathname = url.parse(request.url).pathname;


        if(pathname.indexOf("/favicon.ico")!=-1){
            return tools.return404(response);
        }

        console.log(pathname);

        var action = serverConfig.handlerMapping[pathname];
        if(tools.isFunction(action)){
            var method = request.method;
            if(checkRequestMethod(pathname,method)){
                root._domain.run(function() {
                    action(request,response);
                });
            }else{
                console.warn("request "+pathname+" is not support "+method);
                return tools.return400(response);
            }
        }else{
            return tools.return404(response);
        }

    }

    function checkRequestMethod(pathname,method){
        var methodArr = serverConfig.handlerMethodMapping[pathname];
        for(var i= 0,len=methodArr.length;i<len;i++){
            if(methodArr[i].toUpperCase()==method.toUpperCase()){
                return true;
            }
        }
        return false;
    }

    module.exports = orang;
})();