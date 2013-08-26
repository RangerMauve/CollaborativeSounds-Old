// Make sure you have socket.io and JQuery
Chat = (function(){
	function connect(room,name,callback){
		$.getJSON("/chat/request/"+room,function(data){
			if(!data.success)return callback("Failed");
			var socket = null;
			socket = io.connect("/chat/"+room,{reconnect: false});
			
			socket.on("connect",function(){
				socket.emit("join",name,function(err){
					var domsg = null;
					var dodc = null;
					var dorename = null;
		
					if(err){
						socket.disconnect();
						return callback(err);
					}
					callback(null, {
						set onmessage(callback){domsg = callback;},
						set ondisconnect(callback){dodc = callback;},
						set onrename(callback){dorename = callback;},
						message:function(message,callback){
							if(!(callback instanceof Function))
								callback = function(err){if(err)console.log(room+":Error:"+err)};
							if(message.charAt(0) === "/"){
								socket.emit("command", message.split(" "), callback);
							} else {
								socket.emit("message",message,callback);
							}
						},
						disconnect:function(){
							socket.disconnect();
						}
					});
					socket.on("message",function(name,message){
						if(domsg instanceof Function) domsg(name, message);
						else console.log(room+":"+name+":"+message);
					});
					socket.on("renamed",function(oldname, newname){
						if(dorename instanceof Function)dorename(oldname, newname);
						else console.log(room+": "+oldname+" is now "+newname);
					});
					socket.on("disconnect",function(){
						if(dodc instanceof Function) dodc();
						else console.log(room+": disconnected");
					});
				});
			});
		});
	}
	
	return {
		connect:connect
	}
})();