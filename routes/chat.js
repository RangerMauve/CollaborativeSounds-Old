var chats = {};
var maxlen = 200;
var wait = 1000;

function filterMsg(message){
	if(message.length > maxlen)
		message.length = maxlen;
	message.replace("<","&lt");
	message.replace(">","&gt");
	return message;
}

module.exports = function(app, io){
	app.get("/chat/request/:id",function(req,res){
		if(req.params.id in chats){
			console.info("Confirmed existance of chat "+req.params.id);
			res.json({success:true,message:"Chat exists"});
		} else {
			console.info("Creating chat "+req.params.id);
			chats[req.params.id] = {id:req.params.id,buffer:[],users:{SYSTEM:{}}};
			var curchat = chats[req.params.id];
			var users = curchat.users;
			
			var chatio = io.of("/chat/"+curchat.id);
			chatio.on("connection",function(socket){
				var lastChat = Date.now();
				var user = null;
				
				socket.on("join",function(name,callback){
					if(user){
						callback("AlreadyJoined");
					} else if(name.toUpperCase() in users){
						callback("NameRegistered");
					} else {
						user = {name:name};
						users[name.toUpperCase()]= user;
						socket.on("message",function(message, callback){
							if(wait < Date.now() - lastChat){
								chatio.emit("message", name, filterMsg);
								callback(null);
							} else {
								callback("Spam");
							}
						});
						socket.on("rename",function(newname,callback){
							if(newname.toUpperCase() in users){
								callback("NameRegistered");
							} else {
								delete users[user.name.toUpperCase()];
								users[newname.toUpperCase()] = user;
								socket.broadcast.emit("renamed",user.name, newname);
								callback(null);
							}
						});
						callback(null);
					}
				});
			});
			
			res.json({success:true,message:"Chat Made"});
		}
	});
}