Nodes.init();

var spectating = false;
$("#doparticipate").click(function(){
	$('#participate').hide();
	$('#loggin').show();
});

$("#dolisten").click(function(){
	$('#participate').hide();
	$('#loggin').show();
	$(".speconly").show();
	spectating = true;
});

function spawnNode(type, id){
	$('#nodecont').append(Nodes.create(type, id));
}

function initChat(room,username,callback){
	var out = document.getElementById("chatter");
	function append(message){
		out.innerHTML+=message;
	}

	Chat.connect(room, username, function(err,controls){
		if(callback instanceof Function)
			callback(err)		
		if(err){
			return append('<div style="color:#F00">Error:'+err+'</div>');
		}
		
		controls.onmessage= function(name,message){
			append("<div>"+name+': <span class="usermessage">'+message+"</span></div>");
			$(out).animate({scrollTop:out.scrollHeight}, 1000);
		};
		
		$("#chatinput").keyup(function(e){
			if(e.which == 13)
				controls.message($("#chatinput").val(),function(err){
					if(err)append('<div style="color:#F00">Error:'+err+'</div>');
					else $("#chatinput").val("");
				});
		});
		
		$("#chatsubmit").click(function(e){
			controls.message($("#chatinput").val(),function(err){
				if(err)append('<div style="color:#F00">Error:'+err+'</div>');
				else $("#chatinput").val("");
			});
		});
	});
}

function initRoom(room,username){
	console.log("Attempting room connect to "+room);
	Room.connect(room, {name:username,spectate:spectating},function(err,data){
		if(err){
			data.disconnect();
			console.error(err);
			return alert("Error:"+err);
		}
		console.log("Room connected");
		initChat("lobby",username,function(err,chat){
			if(err){
				console.error(err);
				return alert("Error:"+err);
			}
			data.oncreate = function(id, type){
				spawnNode(type,id);
			};
			console.log("Chat initialized");
			$('#loggin').hide();
			$('#chatwrap').show().draggable();
			$('#workspace').show();
			if(!spectating)
				$('#spawn').show().draggable();
		});
	});
}
function login () {
	console.log("Logging in");
	var username = document.getElementById("username").value;
	if(spectating && !username)
		username = "Anon"+Math.floor(Math.random()*1337);
	var room = document.getElementById("roomname").value;
	room = room || "lobby";
	initRoom(room,username);
}