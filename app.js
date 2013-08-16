
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

GLOBAL.app = express();

// all environments
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "localhost");
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require("./routes");

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on ip:' + app.get('ip') + ' port:' + app.get('port'));
});
