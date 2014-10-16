/**
 * Created by dwskwcaizhiping on 14-10-15.
 */
var orang = require("../lib/orang");

var handlers = [
    {action:"/",handler:function(request,response){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("/index.html");
        response.end();
    },method:["GET"]},
    {action:"/add",handler:function(request,response){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("add");
        response.end();

        //throw new Error("error!!");
    },method:["post","get"]},
    {action:"/delete",handler:function(request,response){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("delete");
        response.end();
    },method:["POST"]},
    {action:"/update",handler:function(request,response){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("update");
        response.end();
    }},
    {action:"/upload",handler:function(request,response){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("upload");
        response.end();
    },method:"POST"}
];

orang.handlerMapping(handlers);

orang.initConfig({
    port : 80
});

orang.start();
