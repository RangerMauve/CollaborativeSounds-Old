function listenTo(id){
    var elm = document.getElementById(id);
    function msg(name,type,val){
        elm.dispatchEvent(
            "changedattr",
            {
                detail:{
                    id:id,
                    name:name,
                    type:type,
                    value:val
                },
                bubbles:true
            }
        );
    }
    function proc(evt){
        var tar = evt.target;
        if(tar.tagName.toUpperCase() === "INPUT"){
            if(tar.type.toUpperCase() === "CHECKBOX"){
                msg(tar.name,"checkbox",tar.checked);
                //console.log(tar.checked);
            } else {
                msg(tar.name,"input",tar.value);
                //console.log(tar.value);
            }
        } else if(tar.tagName.toUpperCase() === "SELECT"){
            msg(tar.name,"select",tar.value);
            //console.log(tar.value);
        }
    }
    
    elm.addEventListener("input",proc);
    elm.addEventListener("change",proc);
    
    return {cancel:function(){
        elm.removeEventListener("input",proc);
        elm.removeEventListener("change",proc);
    }};
}