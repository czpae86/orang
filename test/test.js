/**
 * Created by caizhiping on 14-10-15.
 */
var orang = require("../lib/orang"),
    tools = require("../lib/tools"),
    fs = require("fs"),
    path = require("path"),
    querystring = require("querystring");

var handlers = [
    {action:"/",handler:function(req,res){
        tools.sendFile(req,res,'./index.html');
    },method:["GET"]},

    {action:"/add",handler:function(req,res,params){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(querystring.stringify(params, ';', ':'),"utf8");
        res.end();
    },method:["post","get"]},

    {action:"/delete",handler:function(req,res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("delete");
        res.end();
    },method:["POST"]},

    {action:"/update",handler:function(req,res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("update");
        res.end();
    }},

    {action:"/upload",handler:function(req,res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write("upload");
        res.end();
    },method:"POST"}
];
orang.handlerMapping(handlers);
orang.initConfig({
    port : 80,
    logLevel : "DEBUG",
    staticResource : [path.join(__dirname,"js"),path.join(__dirname,"js2")]
});
orang.start(function(){
    // do something
});
