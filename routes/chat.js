var chats = {};
var maxlen = 200;
var wait = 1000;

module.exports = function(app, io){
	app.get("/chat/request/:id",function(req,res){
		if(req.params.id in chats)res.json({success:true,message:"Chat exists"});
		else {
			chats[params.id] = {buffer:[]};
			
			io.of("/chat/:id").on("connection",function(socket){
				var lastChat = Date.now();
				socket.on("message",function(message,err){
					if(wait < (Date.now() - lastChat)){
						if(message.length > maxlen)
							message.length = maxlen;
						socket.broadcast.emit("message",message);
						lastChat = Date.now();
						err(false);
					} else {
						err("Spam");
					}
				});
			});
		}
	});
}