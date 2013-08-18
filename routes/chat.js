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
				function msg(message){
					console.info(curchat.id+": "+(user ? user.name : "")+":"+message);
				}
				msg("connection");
				var lastChat = Date.now();
				var user = null;
				
				socket.on("join",function(name,callback){
					msg("join attempt from "+name);
					if(user){
						if(callback instanceof Function)callback("AlreadyJoined");
					} else if(name.toUpperCase() in users){
						if(callback instanceof Function)callback("NameRegistered");
					} else if(!name){
						if(callback instanceof Function)callback("NoNameGiven");
					} else {
						user = {name:name};
						users[name.toUpperCase()]= user;
						msg("joined");
						chatio.emit("message", name, " joined the room");
						socket.on("message",function(message, callback){
							msg("says:"+message);
							if(!message){
								if(callback instanceof Function)callback("NoMessage");
							} else if(wait < Date.now() - lastChat){
								lastChat = Date.now();
								chatio.emit("message", name, filterMsg(message));
								curchat.buffer.reverse();
								curchat.buffer.push([name, message]);
								curchat.buffer.reverse();
								curchat.buffer.length = 20;
								if(callback instanceof Function)callback(null);
							} else {
								if(callback instanceof Function)callback("Spam");
							}
						});
						socket.on("rename",function(newname,callback){
							msg("rename attempt to "+newname);
							if(newname.toUpperCase() in users){
								if(callback instanceof Function)callback("NameRegistered");
							} else {
								delete users[user.name.toUpperCase()];
								users[newname.toUpperCase()] = user;
								socket.broadcast.emit("renamed",user.name, newname);
								if(callback instanceof Function)callback(null);
							}
						});
						socket.on("disconnect",function(){
							msg("left");
							delete users[user.name.toUpperCase()];
						});
						if(callback instanceof Function)callback(null);
					}
				});
			});
			
			res.json({success:true,message:"Chat Made"});
		}
	});
};
