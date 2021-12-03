// ==UserScript==
// @name         Planeador Horas Destinadas
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Para cima deles!
// @author       Barb
// @include      https://*screen=place&try=confirm*
// @icon         https://i.imgur.com/p9B7h1l.png
// @run-at       document-start
// ==/UserScript==

var badJStimeDelay = 3200;

var attackDuration;

const delay = ms => new Promise(res => setTimeout(res, ms));

function aleatorio(menor, maior) {
    var intervalo = Math.round(maior - menor);
    return Math.floor(Math.random() * intervalo) + menor + Timing.offset_to_server;
}


var workerScript = "data:text/javascript," +
    "self.onmessage = function(e) {" +
    "    console.log(e.data);" +
    "    self.postMessage('Worker is sending this message');" +
    "};" +
    "console.log('Starting Worker');" +
    "var timeStart = new Date();" +
    "setTimeout(function(){" +
    "    console.log('Worker: ' + Date.now() - timeStart)" +
    "}, 60000);"



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

function getWaitTime(offSet){
    return (getSentAttackTime().getTime() - Timing.getCurrentServerTime()) + offSet;// - Timing.offset_to_server; //Date.now() - badJStimeDelay
}

function getSentAttackTime(){
    var arrivalDate = new Date(document.getElementById('CStime').value);
    var sendDate = new Date(arrivalDate.getTime() - ((parseInt(attackDuration[0])*3600000) + (parseInt(attackDuration[1])*60000) + (parseInt(attackDuration[2])*1000)));
    return sendDate;
}

function accurateWait(offSet){
    console.log('Sending Attack soon');

    //Fazer o calculo para saber quantos milisegundos por amostra
    var iterations = 3000;
    var time = getWaitTime(offSet);

    var divInt = Math.floor(time/iterations);
    var divRemainder = (time/iterations) % 1;

    accuTime( divInt, iterations, () => {
    setTimeout(function(){
        $('#troop_confirm_submit').click();
        console.log('///////////////// SENDING ATTACK //////////////////');
        return
    },Math.round(divRemainder*iterations));});
}

//TODO: Use web workers to have priority if in background task
function ButtonClickAction () {
    document.getElementById ('CSbutton').removeEventListener ("click", ButtonClickAction, false);
    $('#CSbutton').addClass('btn-disabled');
    $('#troop_confirm_submit').addClass('btn-disabled');

    var offSet = parseInt(document.getElementById('CSoffset').value);

    var waitTime = getWaitTime(offSet)-(60000*1);

    //TODO: Criar um worker no github e enviar o waitTime e offset

    if(waitTime > 0){
        console.log('Going to sleep but waking up 1 min before due date');
        setTimeout(function(){
            accurateWait(offSet);
        }, waitTime);
    } else {
        accurateWait(offSet);
    }
}

setTimeout(async function() {
    'use strict';

    $($('.vis')[0].children[0]).append('<tr><td>Chegada:</td><td> <input type="datetime-local" id="CStime" step=".001">' +
                                       '</td></tr><tr> <td>Offset:</td><td> <input type="number" id="CSoffset">' +
                                       '<button type="button" id="CSbutton" class="btn">Confirmar</button> </td></tr>');

    attackDuration = $($('.vis')[0].children[0])[0].children[2].children[1].innerHTML.split(':');

    var defaultTimeDate = new Date(Timing.getCurrentServerTime() + (parseInt(attackDuration[0])*3600000) + (parseInt(attackDuration[1])*60000) + (parseInt(attackDuration[2])*1000));

    await delay(aleatorio(100,200));

    /*var worker = new unsafeWindow.Worker( workerScript);

    worker.postMessage([1,2,3]);

    worker.addEventListener('message', function(e) {
        console.log(e.data);
    }, false);

    var timeStart = new Date();
    setTimeout(function(){
        console.log('Main: ' + Date.now() - timeStart)
    }, 60000);*/

    document.getElementById('CStime').value = defaultTimeDate.toISOString().replace('Z','');
    document.getElementById('CSoffset').value = 0; //Timing.offset_to_server


    //--- Activate the newly added button.
    document.getElementById ('CSbutton').addEventListener ("click", ButtonClickAction, false);

}, 200);
















