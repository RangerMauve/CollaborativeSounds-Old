Nodes.init();

$("#doparticipate").click(function(){
	$('#participate').hide();
	$('#loggin').show()
});

$("#dolisten").click(function(){
	$('#participate').hide();
	login();
});

function spawnNode(type){
	$('#nodecont').append(Nodes.create(type));
}

function initChat(username){
	var out = document.getElementById("chatter");
	function append(message){
		out.innerHTML+=message;
	}

	Chat.connect("lobby", username, function(err,controls){
		controls.onmessage= function(name,message){
			append("<div>"+name+': <span class="usermessage">'+message+"</span></div>");
			$(out).animate({scrollTop:out.scrollHeight}, 1000);
		}; 
		if(err)return append('<div style="color:#F00">Error:'+err+'</div>');
		
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
function login () {
	$('#loggin').hide();
	$('#chatwrap').show().draggable();
	$('#workspace').show();
	$('#spawn').show().draggable();;
	
	var username = document.getElementById("username").value;
		if (username == "") {
		username = "User"+Math.floor(Math.random()*1337);
	}
	initChat(username);
}