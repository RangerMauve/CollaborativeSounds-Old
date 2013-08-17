var context = new webkitAudioContext();



oscilator = context.createOscillator();
oscilator.type=0;


 

$("#selectores").change(function() {
                var selectores = document.getElementById("selectores"); 
                var oscillator = selectores.selectedIndex;
                oscilator.type=oscillator;
               console.log(oscillator);
                
    
    });

oscilator.noteOn(0);


$("#start").click(function() {
  console.log('STARTED');
oscilator.connect(context.destination);

});


$("#stop").click(function() {
  console.log('STOPPED');
oscilator.disconnect();

});



$("#oscFreq").change(function () {


    var freq = document.getElementById('oscFreq').value;

    
    oscilator.frequency.value=this.value;

});


$("#oscDet").change(function () {


    var gain = document.getElementById('oscDet').value;

    

   oscilator.detune.value=this.value;

});

