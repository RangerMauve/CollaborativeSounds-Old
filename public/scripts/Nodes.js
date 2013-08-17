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
		var nodeData = {};
		var cont = document.createElement("div");
		var nid = "Node"+ranString(4);
		while(document.getElementById(nid))
			nid = "Node"+ranString(4);
		nodeData.id = nid;
		nodeData.element = cont;
		nodeData.$element = $(cont);
		cont.id = nid;
		nodeData.emit = function(name, data){
			cont.dispatchEvent(new CustomEvent(name,{
				detail:data,
				bubbles:true,
				cancelable:true
			}));
		}
		cont.className = "node";
		cont.innerHTML = types.default.structure;
		var contr = cont.querySelector(".content");
		contr.innerHTML = types[name].structure;
		contr.className+=" "+name;
		types.default.init(nodeData);
		types[name].init(nodeData);
		list[nid]=nodeData;
		return cont;
	}
	
	function init(){
		register("default",function(data){
			data.element.querySelector(".id").innerHTML = data.id;
			data.$element.draggable();
		});
		register("oscillator",function(data){
			$(data.element.querySelector(".frequency")).change(function(){
				var value = this.value;
				data.element.querySelector(".curfrequency").innerHTML = ""+value;
				data.emit("attrchange",{
					id:data.id,
					param:"frequency",
					type:"range",
					value:value
				});
			});
		});
	}
	
	
	
	return {
		structure:function(name){
			return types[name];
		},
		register:register,
		create:create,
		init:init,
		get list(){
			return list;
		}
	}
})();