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
	
	function clearList(){
		var key,e;
		for(var key in list){
			remove(key);
		}
	}
	
	function remove(id){
		var e = list[id].element;
		e.parentElement.removeChild(e);
		delete list[id]
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
					attribute:attribute,
					type:type || "input",
					value:value
				});
		}
		
		nodeData.update = function(attribute,value, type){
			var at = cont.querySelector("."+attribute);
			if(type === "text"){
				at.innerHTML = value;
			} else if(attribute==="position"){
				cont.style.top = value.top;
				cont.style.left= value.left;
			} else {
				at.value = value;
			}
		}
		
		cont.className = "node";
		cont.innerHTML = types.default.structure;
		var contr = cont.querySelector(".content");
		contr.innerHTML = types[name].structure;
		contr.className+=" "+name;
		types.default.init(nodeData);
		types[name].init(nodeData);
		list[nid]=nodeData;
		nodeData.emit("spawned",{id:nid,type:name});
		return cont;
	}
	
	function init(){
		//document.addEventListener("attrchange",function(evt){console.log(evt.detail);});
		register("default",function(data){
			data.tosave.push("id");
			data.tosave.push("output");
			data.tosave.push("muted");
			data.muted = false;
			data.element.querySelector(".id").innerHTML = data.id;
			$(data.element).draggable({
				drag:function(){
					data.emitChange(
						"position",
						{top:this.style.top,left:this.style.left},
						"point"
					);
				}
			});
			var outsel = data.element.querySelector(".output");
			$(outsel).mousedown(function(){
				var res = '<option></option><option value="null">none</option><option value="main">MainOutput</option>';
				for(var k in list){
					if(k !== data.id)
						res += '<option value="'+k+'">'+k+"</option>";
				}
				outsel.innerHTML = res;
			})
			$(outsel).change(function(){
				data.output = outsel.value;
				data.emitChange("output",outsel.value, "select");
			});
			var mutbut = data.element.querySelector(".mute");
			$(mutbut).click(function(){
				data.muted = !data.muted;
				if(data.muted){
					mutbut.innerHTML = "&#9654;";
				} else {
					mutbut.innerHTML = "&#9632;"
				}
				data.emitChange("muted",data.muted,"abstract");mutbut.inn
			});
			$(data.element.querySelector(".close")).click(function(){
				data.emit("removed",{id:data.id});
				remove(data.id);
			});
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
		register("gain",function(data){
			
		});
	}
	
	return {
		type:function(name){
			return types[name];
		},
		register:register,
		create:create,
		init:init,
		get list(){return list;},
		clear:clearList,
		remove:remove
	}
})();