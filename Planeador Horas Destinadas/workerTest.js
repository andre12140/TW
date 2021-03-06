// postMessage; 0 -> Send Attack; 1 -> get Waiting Time;

var waitTime;
var started = 0;

function accuTime(timer, max, callbackArgument){
  var counter = 1;

  var init = (t) => {
    let timeStart = new Date().getTime();
    setTimeout(function () {
      if (counter < max) {
        let fix = (new Date().getTime() - timeStart) - timer;
        init(t - fix);
        counter++;
      } else {
      // event to be executed at animation end
        callbackArgument();
      }
    }, t);
  }
init(timer);
}

function getWaitTime(){
  postMessage(1);
}

function accurateWait(){
    console.log('Sending Attack soon');

    //Fazer o calculo para saber quantos milisegundos por amostra
    var iterations = 3000;
    var time = waitTime;//getWaitTime();
  console.log('Going to wait accurate ' + time + ' miliseconds');

    var divInt = Math.floor(time/iterations);
    var divRemainder = (time/iterations) % 1;
  

    accuTime( divInt, iterations, () => {
    setTimeout(function(){
      console.log('Worker: Send Attack');
        postMessage(0);
        return
    },Math.round(divRemainder*iterations));});
}



onmessage = function(event) {
    
  if(event.data[0] == 1){
    waitTime = event.data[1];
  }
  if(started == 0){
    started = 1;
    if(waitTime - (60000 * 1) > 0){
        console.log('Going to sleep but waking up 1 min before due date Changed');
        setTimeout(function(){
            waitTime = 60000 * 1;
            accurateWait();
        }, waitTime - (60000 * 1));
    } else {
        accurateWait();
    }
    
  }
}

