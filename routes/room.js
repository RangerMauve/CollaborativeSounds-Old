var rooms = {};

module.exports = function(app, io){
	app.get("/room/request/:id",function(req,res){
		if(req.params.id in rooms){
			res.json({success:true,message:"Room Exists"});
		} else {
			var room = (rooms[req.params.id]={id:req.params.id,users:{},host:null,active:false });
			var users = room.users;
			var roomio = io.of("/room/"+room.id);
			
			roomio.on("connection",function(socket){
				var user = null;
				socket.on("join",function(cred,callback){
					var name = cred.name;
					var pass = cred.password;
					var spect = cred.spectate;
					if(!name && !spect){
						if(callback instanceof Function)return callback("NoName");
					} else if(name.toUpperCase() in users){
						if(callback instanceof Function)return callback("NameInUse");
					} else if(!spect){
						user = (users[name.toUpperCase()]={name:name, host:false });
						if(!room.host){
							user.host = true;
							room.host = user.name;
						}
						socket.on("attrchange",function(change){
							socket.broadcast.emit("attrchange",change);
						});
						socket.on("create", function(id, type){
							socket.broadcast.emit("create",id,type);
						});
					}
					name = name || "Spectator"+Math.floor(Math.random(1337));
					socket.broadcast.emit("joinedroom",name);
					socket.on("disconnect",function(){
						socket.broadcast.emit("leftroom",name);
					});
				});
			});
			
			res.json({success:true,message:"Room Created"});
		}
	});
}
