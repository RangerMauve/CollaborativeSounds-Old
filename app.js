var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 80);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require("./routes")(app);

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on ip:' + app.get('ip') + ' port:' + app.get('port'));
});
