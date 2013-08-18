Room = (function(){
	function connect(room, credentials, callback){
		$.getJSON("/room/request/"+room,function(data){
			if(!data.success)return callback("Failed");
			
			var socket = io.connect("ws://collsounds-nullset.rhcloud.com:8000/room/"+room,{reconnect: false});
			socket.on("connect",function(){
				console.log("Socket opened");
				socket.emit("join",credentials,function(err){
					var onjoin = null,onleave=null,oncreate=null;
					if(err){
						console.log("Join error:"+err);
						socket.disconnect();
						return callback(err);
					}
					console.log("Join successful");
					document.addEventListener("attrchange",onchanged);
					document.addEventListener("create",oncreated);
					document.addEventListener("removenode",onremoved);
					function onchanged(evt){
						socket.emit("attrchange",evt.detail);
					}
					function oncreated(evt){
						socket.emit("ccreate",evt.detail.id,evt.detail.type);
					}
					function onremoved(evt){
						socket.emit("cremove",evt.detail);
					}
					socket.on("disconnect",function(){
						document.removeEventListener("attrchange",onchanged);
						document.removeEventListener("create",oncreated);
						document.removeEventListener("removenode",onremoved);
						//alert("Disconnected From Room");
					});
					socket.on("create",function(id,type){
						if(oncreate instanceof Function)
							oncreate(id,type);
						console.log("Remote create: "+id+" "+type);
					});
					socket.on("remove",function(id){
						Nodes.remove(id);
					});
					socket.on("attrchange",function(detail){
						Nodes.update(detail);
					});
					
					var hassynced = false;
					console.log("Requesting sync");
					socket.emit("requestsync","please");
					socket.on("answersync",function(data){
						if(hassynced)return;
						console.log("Sync request answered");
						console.log(data);
						console.log("Parsing data");
						var nd = Nodes.createFrom(data);
						console.log("Parsed data is:")
						console.log(nd);
						for(var i in nd)
							$("#nodecont").append(nd[i]);
						hassynced=true;
					});
					socket.on("requestsync",function(callback){
						var data = Nodes.savedData();
						console.log("Sending data");
						console.log(data);
						socket.emit("answersync",data);
					});
					
					callback(null, {
						set onjoin(callback){
							onjoin = callback;
						},
						set onleave(callback){
							onleave = callback;
						},
						set oncreate(callback){
							oncreate = callback;
						},
						disconnect:function(){socket.disconnect();}
					});
				});
			});
		});
	}
	return {
		connect:connect
	};
})();