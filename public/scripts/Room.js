Room = (function(){
	function connect(room, credentials, callback){
		$.getJSON("/room/request/"+room,function(data){
			if(!data.success)return callback("Failed");
			
			var socket = io.connect("/room/"+room,{reconnect: false});
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
					function onchanged(evt){
						socket.emit("attrchange",evt.detail);
					}
					function oncreated(evt){
						socket.emit("ccreate",evt.detail.id,evt.detail.type);
					}
					socket.on("disconnect",function(){
						document.removeEventListener("attrchange",onchanged);
						document.removeEventListener("create",oncreated);
						alert("Disconnected From Room");
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