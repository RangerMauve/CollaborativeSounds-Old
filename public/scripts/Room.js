Room = (function(){
	function connect(room, credentials, callback){
		$.getJSON("/room/request/"+room,function(data){
			if(!data.success)return callback("Failed");
			
			var socket = io.connect("/room/"+room,{reconnect: false});
			socket.on("connect",function(){
				console.log("Socket opened");
				socket.emit("join",credentials,function(err){
					var onjoin = null,onleave=null;
					if(err){
						console.log("Join error:"+err);
						socket.disconnect();
						return callback(err);
					}
					console.log("Join successful");
					document.addEventListener("attrchange",onchanged);
					function onchanged(evt){
						socket.emit("attrchange",evt.detail);
					}
					socket.on("disconnect",function(){
						document.removeEventListener("attrchange",onchanged);
						alert("Disconnected From Room");
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