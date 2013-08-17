var fs = require('fs');

module.exports = function(app,io){
// Read other files in dir
	var files = fs.readdirSync(__dirname);
	for(var i = 0; i < files.length; i++){
		if(files[i] != "index.js"){
			require(require('path').join(__dirname, files[i]))(app,io);
		}
	}
}