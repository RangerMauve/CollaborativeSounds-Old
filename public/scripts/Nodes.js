Nodes = (function(){
	var types = {};
	var list = {};
	
	function ranString(length){
		var s = [0,1,2,3,4,5,6,7,8,8,'A','B','C','D','E','F'];
		var res = "";
		for(var i = 0; i < length; i++)
			res+= s[Math.floor(Math.random()*s.length)]||"";
		return res;
	}
	
	function register(name, structure, init){
		if(!init){
			init = structure;
			structure = document.getElementById(name).innerHTML;
		}
		types[name] = {
			name:name,
			structure:structure,
			init:init
		}
	}
	
	function create(name){
		var cont = document.createElement("div");
		var nid = "Node"+ranString(4);
		while(!document.getElementById(nid))
			nid = "Node"+ranString(4);
		cont.id = nid;
		cont.className = "node "+name;
		cont.innerHTML = types.default.structure;
		cont.querySelector(".content").innerHTML = types[name].structure;
		types.default.init(cont);
		types[name].init(cont);
	}
	
	return {
		structure:function(name){
			return types[name];
		},
		register:register,
		create:create
	}
})();