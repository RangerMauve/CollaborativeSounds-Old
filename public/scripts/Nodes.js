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
		cont.id = nid;
		nodeData.tosave = [];
		nodeData.emit = function(name, data){
			cont.dispatchEvent(new CustomEvent(name,{
				detail:data,
				bubbles:true,
				cancelable:true
			}));
		}
		nodeData.emitChange = function(attribute, value, type){
			this.emit("attrchange",{
					id:this.id,
					param:attribute,
					type:type || "input",
					value:value
				});
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
		document.addEventListener("attrchange",function(evt){
			console.log(evt.detail);
		});
		register("default",function(data){
			data.tosave.push("id");
			data.element.querySelector(".id").innerHTML = data.id;
			$(data.element).draggable();
		});
		register("oscillator",function(data){
			data.tosave.push("frequency");
			data.tosave.push("type");
			data.tosave.push("detune");
			var e = data.element;
			data.frequency = e.querySelector(".frequency").value;
			data.type = e.querySelector(".type").value;
			data.detune = e.querySelector(".detune").innerHTML;
			
			$(e.querySelector(".frequency")).change(function(){
				data.frequency = this.value;
				e.querySelector(".curfrequency").innerHTML = ""+this.value;
				data.emitChange("frequency",this.value,"range");
				data.emitChange("curfrequency",this.value,"text");
			});
			$(e.querySelector(".type")).change(function(){
				data.type = this.value;
				data.emitChange("type",this.value,"select");
			});
			$(e.querySelector(".decdetune")).click(function(){
				data.detune--;
				e.querySelector(".detune").innerHTML = data.detune;
				data.emitChange("detune", data.detune,"text");
			});
			$(e.querySelector(".incdetune")).click(function(){
				data.detune++;
				e.querySelector(".detune").innerHTML = data.detune;
				data.emitChange("detune", data.detune,"text");
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