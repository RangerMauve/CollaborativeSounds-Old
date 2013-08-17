// Make sure you have socket.io and JQuery
Chat = (function(){
	function connect(room,name,callback){
		var socket = null;
		var domsg = null;
		var dodc = null;
		var dorename = null;
		
		$.getJSON("/chat/request/"+room,function(data){
			console.log("Chat Request to "+room+":");
			console.log(data);
			socket = io.connect("/chat/"+room);
			
			socket.on("connect",function(){
				socket.emit("join",name,function(err){
					if(err)return callback(err);
					callback( 
						null,
						{
							socket:socket,
							set onmessage(callback){domsg = callback;},
							set ondisconnect(callback){dodc = callback;},
							set onrename(callback){dorename = callback;},
							message:function(message,callback){
								if(!(callback instanceof Function))
									callback = function(err){if(err)console.log(room+":Error:"+err)};
								socket.emit("message",message,callback);
							},
							rename: function(newname,callback){
								if(!(callback instanceof Function))
									callback = function(err){if(err)console.log(room+":Error:"+err)};
								socket.emit("rename",newname, callback);
							}
						}
					);
					socket.on("message",function(name,message){
						if(domsg instanceof Function) domsg(name, message);
						else console.log(room+":"+name+":"+message);
					});
					socket.on("renamed",function(oldname, newname){
						if(dorename instanceof Function)dorename(oldname, newname);
						else console.log(room+": "+name+" is now "+newname);
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