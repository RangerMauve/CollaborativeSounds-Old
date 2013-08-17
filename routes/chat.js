var chats = {};
var maxlen = 200;
var wait = 1000;

module.exports = function(app, io){
	app.get("/chat/request/:id",function(req,res){
		if(req.params.id in chats)res.json({success:true,message:"Chat exists"});
		else {
			
			chats[req.params.id] = {id:req.params.id,buffer:[],users:{SYSTEM:{}}};
			var curchat = chats[req.params.id];
			
			io.of("/chat/:id").on("connection",function(socket){
				var lastChat = Date.now();
				var name = null;
				socket.on("message",function(message,err){
					if(wait < (Date.now() - lastChat)){
						if(message.length > maxlen)
							message.length = maxlen;
						message.replace("<","&lt");
						message.replace(">","&gt");
						socket.broadcast.emit("message",name,message);
						lastChat = Date.now();
						err(false);
					} else {
						err("Spam");
					}
				});
				soccket.on("join",function(name,err){
					if(name in curchat){
						err("NameTaken");
					} else {
						if(name){
						
						} else {
							socket.broadcast.emit("message"
						}
					}
				});
			});
		}
	});
}