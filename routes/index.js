var fs = require('fs');

module.exports = function(app,io){
// Read other files in dir
	var files = fs.readdirSync(__dirname);
	for(var i = 0; i < files.length; i++){
		if(files[i].indexOf("index") < 0){
			console.log("Loading "+files[i]);
			require(require('path').join(__dirname, files[i]))(app,io);
		}
	}
}