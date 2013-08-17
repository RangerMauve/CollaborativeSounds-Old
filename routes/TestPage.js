
module.exports = function(app, io){
	io.of("/testpage").on("connection",function(socket){
		socket.on("changed",function(data){
			socket.broadcast.emit("changed", data);
		});
		socket.on("create", function(id, type){
			socket.broadcast.emit("create", id, type);
		});
	});
};