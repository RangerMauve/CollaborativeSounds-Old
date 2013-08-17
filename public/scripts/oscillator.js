var context = new webkitAudioContext();



oscilator = context.createOscillator();
oscilator.type=0;


var filter = context.createBiquadFilter();

var gain = context.createGainNode();    




filter = context.createBiquadFilter();

$("#selectores").change(function() {
                var selectores = document.getElementById("selectores"); 
                var oscillator = selectores.selectedIndex;
                oscilator.type=oscillator;
               console.log(oscillator);
                
    
    });

oscilator.noteOn(0);


$("#start").click(function() {
  console.log('STARTED');
oscilator.connect(filter);
oscilator.connect(gain);

filter.connect(context.destination);
gain.connect(context.destination);
oscilator.connect(context.destination);    

	

});


$("#stop").click(function() {
  console.log('STOPPED');
oscilator.disconnect();
filter.disconnect(); 
gain.disconnect();
});



$("#oscFreq").change(function () {
var freq = document.getElementById('oscFreq').value;

    
    oscilator.frequency.value=this.value;

});


$("#oscQ").change(function () {

    var qued = document.getElementById('oscQ').value;
    

    filter.Q.value = this.value; 
    console.log(filter.Q.value); 

/*
    
    console.log(oscilator.Q.value=this.value); 
    * 
    * */ 
    
        
    
});







$("#oscDet").change(function () {

    var detune = document.getElementById('oscDet').value;

   oscilator.detune.value=this.value;

}); 





$("#vol").change(function () {

        
        var gained = this.value;
        gain.gain.value = gained;
        console.log(gain.gain.value);

});



