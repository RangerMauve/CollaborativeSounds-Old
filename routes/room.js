var rooms = {};

module.exports = function(app, io){
	app.get("/room/request/:id",function(req,res){
		if(req.params.id.toUpperCase() in rooms){
			res.json({success:true,message:"Room Exists"});
		} else {
			var room = (
				rooms[req.params.id.toUpperCase()]=
					{
						id:req.params.id,
						users:{},
						host:null,
						active:false
					}
				);
			var users = room.users;
			var roomio = io.of("/room/"+room.id);
			
			roomio.on("connection",function(socket){
				var user = null;
				function msg(msg){
				
					console.log(room+": "+ (user?user.name:"")+": "+msg);
				}
				msg("Connection");
				socket.on("join",function(cred,callback){
					msg("join from "+JSON.stringify(cred));
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
					} else {
						user.spectating = true;
					}
					user.name = name || "Spectator"+Math.floor(Math.random(1337));
					socket.broadcast.emit("joinedroom",user.name);
					socket.on("disconnect",function(){
						delete users[user.name.toUpperCase()]
						socket.broadcast.emit("leftroom",user.name);
					});
					callback(null);
				});
			});
			
			res.json({success:true,message:"Room Created"});
		}
	});
	app.get("/room/info/:id",function(req,res){
		if(req.params.id.toUpperCase() in rooms){
			res.json({
				success:true,
				message:"Room Found",
				room:rooms[req.params.id.toUpperCase()]
			});
		} else {
			res.json({error:true,message:"Room Not Registered"});
		}
	});
	app.get("/rooms/info",function(req,res){
		res.json({success:true,message:"Rooms found",rooms:rooms});
	});
};
