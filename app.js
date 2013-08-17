var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);


// all environments
app.set('ip', process.env.OPENSHIFT_NODEJS_IP);
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 80);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
io.configure(function(){
	io.set('log level', 2);
	io.set("transports",["websocket"]);
	//io.enable("browser client minification");
	//io.enable("browser client gzip");
});


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

require("./routes")(app,io);

if(app.get("ip")){
	server.listen(app.get('port'),app.get('ip'),function(){
		console.log('Express server listening on ip:' + app.get('ip') + ' port:' + app.get('port'));
	});
} else {
	server.listen(app.get('port'),app.get('ip'),function(){
		 console.log('Express server listening on  port:' + app.get('port'));
	});
}

module.exports = {
	app:app,
	io:io
};
