orang
=====

nodejs http server

=====
##Example

```javascript
var orang = require("../lib/orang");

var handlers = [
    {action:"/add",handler:function(request,response){
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("add");
        response.end();
    },method:["post","get"]},
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
```
