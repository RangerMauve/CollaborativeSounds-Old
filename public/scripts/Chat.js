// Make sure you have socket.io and JQuery
Chat = (function(){
	function requestConnect(room,name,fail){
		var chatsocket = null;
		$.getJSON("/chat/request/"+room,function(data){
			console.log("Chat Request to "+room+":");
			console.log(data);
			socket = io.connect("/chat/+"room);
		});
	}
})();