var Dragging = (function(){
	var curelm, startpos, offset,cancels = [];

	function toSVGSpace(x,y,element){
		var svg = document.querySelector('svg');
		var point = svg.createSVGPoint();
		point.x = x;
		point.y = y;
		return point.matrixTransform(element.getScreenCTM().inverse());

	}

	function elementOffsetTo(elm, x, y){
		var p = elm.getBoundingClientRect();
		var bb = elm.getBBox();
		return {
			x: (x-p.left+bb.x/bb.width*p.width),
			y:(y-p.top+bb.y/bb.height*p.height)
		};
	}

	// Perform logic when the user moves their mouse
	function onmove(evt){
		// If not draggin an element, don't bother doing anything else
		if(!curelm)return;

		// Record the new position of the mouse
		var endpos = {x:evt.clientX,y:evt.clientY};

		// Calculate the new mouse position
		var screenpos = {
			x:endpos.x-offset.x,
			y:endpos.y-offset.y
		};

		// Record all the relevant data to the drag
		var data = {
			screenStart:startpos,
			screenEnd:endpos,
			screenPos:screenpos,
            worldStart:toSVGSpace(startpos.x,startpos.y,curelm),
            worldEnd:toSVGSpace(endpos.x, endpos.y,curelm),
            worldPos:toSVGSpace(screenpos.x,screenpos.y,curelm)		};

		// Move the element to the new position
		curelm.setAttribute(
			"transform",
			"translate("+data.worldPos.x+","+data.worldPos.y+")");

		// Dispatch an event so that it can be handled
		curelm.dispatchEvent(new CustomEvent("drag",{detail:data,bubbles:true}));

		// Reset the start position
		startpos =  {x:evt.clientX,y:evt.clientY};
	}

	function onup(evt){
		curelm = null;
		startpos = null;
		offset = null;
	}

	function init(){
		var k,elms = document.querySelectorAll(".draggable");
		console.log("Grabbing elements to dragify");
		console.log(elms);
		for(var k = 0; k < elms.length; k++)makedrag(elms[k]);
		console.log("Adding document listeners");
		document.addEventListener("mouseup",onup,false);
		document.addEventListener("mousemove",onmove,false);
	}
	function uninit(){
		console.log("Cancelling element dragging");
		for(var i = 0; i < cancels.length; i++)
			cancels[i]();
		cancels.length = 0;
		console.log("Removing drag listeners from document");
		document.removeEventListener("mouseup",onup);
		document.removeEventListener("mousemove",onmove);
	};

	function makedrag(element){
		var cancel, index; 
		console.log("Adding drag to:");
		console.log(element);
		// Save event handler so it can be removed
		// When clicked: set current dragged element to this and
		// Save the current mouse position
		function ondown(evt){
			curelm = element;
			startpos = {x:evt.clientX,y:evt.clientY};
			offset = elementOffsetTo(element,evt.clientX,evt.clientY);
		};

		element.addEventListener("mousedown",ondown,false);

		cancel = function(){
			element.removeEventListener("mousedown",ondown);
			if((index = cancels.indexOf(cancel)) >= 0){
				cancels.splice(index,1);
			}
		}
		cancels.push(cancel);
		return {
			get cancel(){
				return cancel;
			}
		}
	}
	return {
		get init(){return init;},
		get uninit(){return uninit;},
		get drag(){return makedrag;}
	}
})();
