var fs = require('fs');

// Read other files in dir
var files = fs.readdirSync(__dirname);
for(var i = 0; i < files.length; i++){
	if(files[i] != "index.js"){
		require("./"+files[i])
	}
}