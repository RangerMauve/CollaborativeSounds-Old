var chats = {};
var maxlen = 200;
var wait = 1000;

module.exports = function(app, io){
	app.get("/chat/request/:id",function(req,res){
		if(req.params.id in chats)res.json({success:true,message:"Chat exists"});
		else {
			
			chats[req.params.id] = {id:req.params.id,buffer:[],users:{SYSTEM:{}}};
			var curchat = chats[req.params.id];
			var users = curchat.users;
			
			io.of("/chat/:id").on("connection",function(socket){
				var lastChat = Date.now();
				var user = null;
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
				
				soccket.on("join",function(nname,err){
					if(nname.toUpperCase() in users){
						err("NameTaken");
					} else {
						if(user.name){
							socket.broadcast.emit("message",server,user.name+" is now "+nname+".");
						} else {
							socket.broadcast.emit("message",server,nname+" has joined the chat.");
							user = (users[nname.toUpperCase()] = {name:nname});
						}
						if(""+user.name.toUpperCase() in curchat.users)
							delete curchat.users[""+user.name.toUpperCase()];
						curchat.users[nname.toUpperCase()]=user;
						user.name = nname;
						err(false);
					}
				});
			});
			
			res.json({success:true,message:"Chat Made"});
		}
	});
}