Nodes = (function(){
	var types = {};
	var list = {};
	var mainout = null;
	window.context= null;
	
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
		if(list[id])
		list[id].sound.output.disconnect();
		var e = list[id].element;
		e.parentElement.removeChild(e);
		delete list[id]
		document.dispatchEvent(new CustomEvent("removenode",{detail:id}));
	}
	
	function register(name, init, onchange){
		var structure = document.getElementById(name).innerHTML;
		types[name] = {
			name:name,
			structure:structure,
			init:init,
			onchange:onchange
		}
	}
	
	function update(change){
		var dat;
		if(dat = list[change.id]){
			dat.update(change.attribute,change.value,change.type);
			dat.element.dispatchEvent(
				new CustomEvent("attrchange",{
					detail:change,
					bubbles:false
				})
			);
		}
	}
	
	function createFrom(data){
		if(data instanceof Array){
			var res = [];
			for(var i = 0; i < data.length; i++){
				var cures = createFrom(data[i])
				res.push(cures);
			}
			return res;
		} else {
			var res = create(data.nodetype,data.id);
			for(var key in data){
				res.dispatchEvent(
					new CustomEvent("attrchange",{
						detail:{
							id:data.id,
							attribute:key,
							value:data[key]
						},
						bubbles:false
					}
				));
			}
			return res;
		}
	}
	
	function savedData(){
		var res = [];
		for(var key in list){
			var cres = {};
			var data = list[key];
			for(var key2 in data){
				if(data.tosave.indexOf(key2) >= 0){
					cres[key2] = data[key2];
				}
			}
			res.push(cres);
		}
		return res;
	}
	
	function create(name, gid){
		var nodeData = {};
		var cont = document.createElement("div");
		var nid = gid || "Node"+ranString(4);
		nodeData.id = nid;
		nodeData.element = cont;
		nodeData.nodetype = name;
		cont.id = nid;
		nodeData.tosave = ["nodetype"];
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
			if(nodeData.tosave.indexOf(attribute) >=0){
				nodeData[attribute]=value;
			}
		}
		cont.addEventListener("attrchange",function(evt){
			types.default.onchange(evt.detail,nodeData);
			types[name].onchange(evt.detail,nodeData);
		});
		cont.innerHTML = '<span class="nodewra"><div class="node">'+types.default.structure+"<div></span>";
		var contr = cont.querySelector(".content");
		contr.innerHTML = types[name].structure;
		contr.className+=" "+name;
		types.default.init(nodeData);
		types[name].init(nodeData);
		list[nid]=nodeData;
		if(!gid)
		document.dispatchEvent(new CustomEvent("create", {detail:{id:nid,type:name}}));
		return cont;
	}
	
	function init(){
		console.log("Initializing nodes");
		context = new webkitAudioContext();
		mainout = context.createGainNode();
		mainout.gain.value = 0.1;
		mainout.connect(context.destination);
		//document.addEventListener("attrchange",function(evt){console.log(evt.detail);});
		register("default",function(data){
			data.tosave.push("id");
			data.tosave.push("output");
			data.tosave.push("muted");
			data.muted = false;
			data.sound = {};
			data.sound.input = context.createGainNode();
			data.sound.output = context.createGainNode();
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
				var val = outsel.value;
				data.output = val;
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
				data.emitChange("muted",data.muted,"abstract");
			});
			$(data.element.querySelector(".close")).click(function(){
				data.emit("removed",{id:data.id});
				remove(data.id);
			});
		}, function(changed,data){
			var d = false;
			if(changed.attribute === "muted" || changed.attribute === "output"){
				if(data.muted){
					data.sound.output.disconnect();
				} else {
					var val = data.output;
					if(!val || val==="none"){
						data.sound.output.disconnect();
					} else if(val==="main") {
						data.sound.output.disconnect();
						data.sound.output.connect(mainout);
					} else if(list[val]) {
						var tocon = list[val].sound;
						data.sound.output.disconnect();
						data.sound.output.connect(tocon.input);
					}
				}
			}
		});
		register("oscillator",function(data){
			data.tosave.push("frequency");
			data.tosave.push("type");
			data.tosave.push("detune");
			var e = data.element;
			data.frequency = e.querySelector(".frequency").value;
			data.type = e.querySelector(".type").value;
			data.detune = e.querySelector(".detune").innerHTML;
			data.sound.oscillator = context.createOscillator();
			data.sound.oscillator.type = data.type || "sine";
			data.sound.oscillator.frequency.value = data.frequency || 200;
			data.sound.oscillator.detune.value = +data.detune || 0;
			data.sound.oscillator.connect(data.sound.output);
			data.sound.oscillator.start(0);
			
			$(e.querySelector(".frequency")).change(function(){
				data.frequency = +this.value;
				data.emitChange("frequency",this.value,"range");
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
		}, function(change,data){
			if(change.attribute == "frequency"){
				data.element.querySelector(".curfrequency").innerHTML = ""+data.frequency;
				data.sound.oscillator.frequency.value = data.frequency;
			} else if(change.attribute === "detune"){
				data.sound.oscillator.detune.value = data.detune;
			} else if(change.attribute === "type"){
				data.sound.oscillator.type = data.type;
			}
		});
		register("gainnode",function(data){
			var gainin = data.element.querySelector(".gain");
			data.tosave.push("gain");
			data.gain = gainin.value;
			data.sound.gain = context.createGainNode();
			data.sound.gain.gain.value=data.gain;
			data.sound.gain.connect(data.sound.output);
			data.sound.input.connect(data.sound.gain);
			
			$(gainin).change(function(){
				data.gain = +gainin.value;
				data.emitChange("gain",gainin.value);
			});
		},function(change,data){
			if(change.attribute === "gain"){
				data.element.querySelector(".gain").value=+data.gain;
				data.element.querySelector(".curgain").innerHTML=+data.gain.toFixed(2);
				data.sound.gain.gain.value=data.gain;
			}
		});
		register("delaynode", function(data){
			var delayTimeIn = data.element.querySelector(".delay");
			data.tosave.push("delay");
			data.delay = delayTimeIn.value;
			data.sound.delay = context.createDelayNode();
			data.sound.delay.delayTime.value = data.delay;
			data.sound.delay.connect(data.sound.output);
			data.sound.input.connect(data.sound.delay);

			$(delayTimeIn).change(function(){
				console.log(delayTimeIn.value);
				data.delay = +delayTimeIn.value;
				data.emitChange("delay", delayTimeIn.value);
			});
		},function(change, data){
			if(change.attribute === "delayTime"){
				console.log(data.delay);
				data.element.querySelector(".delay").value = data.delay;
				data.element.querySelector(".curdelay").innerHTML = data.delay.toFixed(2);
				data.sound.delay.delayTime.value = data.delay;
			}

		});
		register("splitter",function(data){
			var outsel = data.element.querySelectorAll(".outputn");
			$(outsel).mousedown(function(){
				for(var i = 2; i < 5; i++){
					data["output"+i]="none"
					var tm = (data.sound["output"+i]= context.createGainNode());
					console.log(tm);
					tm.connect(data.sound.output);
					data.sound.input.connect(tm);
				}
				console.log("Hovered");
				var res = '<option></option><option value="null">none</option><option value="main">MainOutput</option>';
				for(var k in list){
					if(k !== data.id)
						res += '<option value="'+k+'">'+k+"</option>";
				}
				this.innerHTML =res;
			})
			$(outsel).change(function(){
				var cur = this.className.split(" ")[0];
				data[cur] = this.value;
				console.log(cur+": "+this.value);
				data.emitChange(cur, this.value,"select");
			});
		},function(change,data){
			if(change.attribute.indexOf("output") >= 0 && change.attribute!=="output"){
				console.log(arguments);
				var output = change.attribute;
				var val = data[output];
				if(!val || val==="none"){
					data.sound[output].disconnect();
				} else if(val==="main") {
					data.sound[output].disconnect();
					data.sound[output].connect(mainout);
				} else if(list[val]) {
					data.sound[output].disconnect();
					data.sound[output].connect(tocon.input);
				}
			} if(change.attribute === "muted"){
				if(change.value){
					for(var i = 2; i < 5; i++){
						var conname = data["output"+i];
						var tocon = null;
						if(conname in list)list[conname].sound.input;
						if(conname ==="main")tocon == mainout;
						if(conname !== "non" && conname !== "null"){
							data.sound["output"+i].connect(tocon);
						} else data.sound["output"+i].disconnect();
					}
				} else {
					for(var i = 2; i < 5; i++){
						data.sound["output"+i].disconnect();
					}
				}
			}
		});
		register("attacknode",function(data){
			data.tosave.push("attack");
			var atcon = data.element.querySelector(".attack");
			data.attack = atcon.value;
			var conn = true;
			var buf = context.createGainNode();
			data.sound.input.connect(buf);
			buf.connect(data.sound.output);
			function alternate(){
				conn = !conn;
				if(conn){
					console.log("switch");
					buf.disconnect();
				} else {
					buf.connect(data.sound.output);
				}
				setTimeout(alternate,data.attack);
			}
			setTimeout(alternate,1000);
			$(atcon).change(function(){
				console.log(this.value);
				data.attack = +this.value;
				data.emitChange("attack",data.attack,"input");
			});
		},function(change,data){
			
		});
	}
	
	return {
		type:function(name){
			return types[name];
		},
		register:register,
		create:create,
		createFrom:createFrom,
		savedData:savedData,
		init:init,
		get list(){return list;},
		clear:clearList,
		remove:remove,
		update:update
	}
})();