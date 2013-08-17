// Make sure you have socket.io and JQuery
Chat = (function(){
	function connect(room,name,fail){
		var socket = null;
		var domsg = null;
		var dodc = null;
		$.getJSON("/chat/request/"+room,function(data){
			console.log("Chat Request to "+room+":");
			console.log(data);
			socket = io.connect("/chat/+"room);
			
			socket.on("connect",function(){
				rename(name,fail);
			});
			
			socket.on("disconnect",function(){
				if(dodc)dodc();
			});
			
			socket.on("message",function(){
				if(domsg)domsg.apply(null, arguments);
			})
			
			function rename(newname,fail){
				socket.emit("join",newname,callback);
			}
			
			function sendmsg(message,fail){
				socket.emit("message",message,fail);
			}
			
			function dc(){
				socket.disconnect();
			}
			
			return {
				onmessage:function(callback){domsg = callback;},
				ondisconnect:function(callback){dodc = callback;},
				rename:rename,
				sendmessage:sendmsg
				disconnect:dc
			}
		});
		return {
			connect:connect
		}
	}
})();