// ==UserScript==
// @name                Scavenging
// @namespace           http://tampermonkey.net/
// @version             0.1
// @description         Para cima deles!
// @author              Barb
// @icon                https://i.imgur.com/p9B7h1l.png
// @include             https://**.tribalwars.com.*/game.php?**&mode=scavenge*
//
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_listValues
// @grant GM_deleteValue
// @grant GM_addStyle
// @grant GM_xmlhttpRequest
// ==/UserScript==

//Colocar coordenadas das aldeias que são para farmar
var coordAldeiasAtacar = [
[442,533], //001
[426,524], //002
[458,535], //003
[443,528], //004
[462,530], //005
[470,536], //006
[474,540], //007
[406,574], //008
[442,531], //009
[479,538], //010
[474,539], //011
];

var savedMap;
var mapKeys;
var mapValues;

var processMap;

var nextVillageBTN;

var nextCoords = [];

const delay = ms => new Promise(res => setTimeout(res, ms));

var hrs;
var min;
var sec;

function altAldeia(){
    nextVillageBTN.click();
}
function aleatorio(menor, maior) {
    var intervalo = Math.round(maior - menor);
    return Math.floor(Math.random() * intervalo) + menor + Timing.offset_to_server;
}
// Recarrega a pagina a cada X minutos
function recarregar(minutos) {
    setInterval(function () {
        altAldeia();
    }, aleatorio((minutos*60*1000)-5000, (minutos*60*1000)+5000));
}

function newMap(){
    savedMap = new Map();
    for(var a = 0; a < coordAldeiasAtacar.length ;a++){ //Preencher novo mapa
        savedMap.set(coordAldeiasAtacar[a], new Date());
    }
}

async function changeVillage(){
    var Dates = Array.from(processMap.values());
    var coordsAttack = Array.from(processMap.keys());
    document.getElementById('open_groups').click();
    await delay(aleatorio(300, 500));
    var timediff = Dates[0].getTime() - Date.now();
    var timediffaux = 0;
    for(var x = 0; x < Dates.length; x++){
        if(Dates[x].getTime() < Date.now()){
            var allVillages = document.getElementById('group_popup_content_container').firstElementChild.firstElementChild.getElementsByTagName('td');
            var coords = [];
            for(var i = 1; i < allVillages.length; i=i+2){
                coords = allVillages[i].innerHTML.replaceAll(/\s/g,'').split('|');
                if(JSON.stringify([parseInt(coords[0]),parseInt(coords[1])]) == coordsAttack[x]){
                    console.log('Changing Village to: ' + coordsAttack[x]);
                    await delay(aleatorio(300, 1000));
                    allVillages[i-1].firstElementChild.click();
                    break;
                }
            }
        }
        timediffaux = Dates[x].getTime() - Date.now();
        if(timediffaux < timediff){
            timediff = timediffaux;
        }
    }
    console.log('Entrar numa espera durante: ' + timediff + ' millisegundos');
    document.getElementById('close_groups').click();
    window.setTimeout(changeVillage, timediff + 30000); //Esperar pela proxima colheita livre mais 30 segundos de margem
}


// Buscar e Validar Objeto
function buscarObjeto(sObj) {
    var objeto = document.querySelectorAll(sObj);
    if (objeto !== undefined && objeto[0] !== undefined) {
        return objeto;
    } else {
        return undefined;
    }
}

function parseAsInteger(txt, divisor) {
    var retInt = 0;
    var valor = parseInt(txt.replace('(', '').replace(')', ''));
    if (valor > 0 && divisor > 0) {
        retInt = Math.trunc(valor / divisor);
    }
    return retInt;
}

function selecionarTropas(botoesDisponiveis) {

    var lanca = document.getElementsByName("spear")[0];
    var espada = document.getElementsByName("sword")[0];
    var machado = document.getElementsByName("axe")[0];

    var divisor = 0;
    if (botoesDisponiveis == 4) {
        divisor = 13;
    } else if(botoesDisponiveis == 3){
        divisor = 8;
    } else if(botoesDisponiveis == 2){
        divisor = 3.5;
    } else {
        var nrLanca = $("a.units-entry-all[data-unit='spear']")[0];
        var nrEspada = $("a.units-entry-all[data-unit='sword']")[0];
        var nrMachado = $("a.units-entry-all[data-unit='axe']")[0];

        nrLanca.click();
        nrEspada.click();
        nrMachado.click();

        return;
    }

    lanca.value = parseAsInteger($("a.units-entry-all[data-unit='spear']")[0].innerText, divisor);
    lanca.dispatchEvent(new KeyboardEvent('keyup', {
        'key': '0'
    }));

    espada.value = parseAsInteger($("a.units-entry-all[data-unit='sword']")[0].innerText, divisor);
    espada.dispatchEvent(new KeyboardEvent('keyup', {
        'key': '0'
    }));

    machado.value = parseAsInteger($("a.units-entry-all[data-unit='axe']")[0].innerText, divisor);
    machado.dispatchEvent(new KeyboardEvent('keyup', {
        'key': '0'
    }));
}

/**
     * Get button count on the container
     *
     * @param {HtmlElement} obj
     */
function getButtonCount(obj) {
    var objRet = {};
    objRet.btn = [];
    var cont = 0;
    for (var i = 0; i < 4; i++) {
        if (obj[i] !== undefined) {
            cont = cont + 1;
            objRet.btn[i] = obj[i];
        }
    }
    objRet.cont = cont;
    return objRet;
}

async function logica(atual) {
    var btns = buscarObjeto("a.btn.btn-default.free_send_button:not(.btn-disabled)");
    var unlockBtns = buscarObjeto("a.btn.btn-default.unlock-button:not(.btn-disabled)");
    var unlockingBtns = document.getElementsByClassName('unlock-countdown-icon');
    var unlockBtnsDim = 0;
    if(unlockBtns !== undefined){
        unlockBtnsDim = unlockBtns.length;
    }
    if(unlockingBtns !== undefined){
        unlockBtnsDim += unlockingBtns.length;
    }
    if (btns !== undefined) {
        var disp = getButtonCount(btns);
        if (disp.cont == 4 - unlockBtnsDim) {
            for (var i = 4 - unlockBtnsDim; i > 0; i--) {
                await delay(aleatorio(1500, 2000));
                selecionarTropas(i);
                console.log('Selected Trops for ', i, ' Left');
                await delay(aleatorio(3000, 4000));
                disp.btn[i-1].click();
                console.log('BTN ', i, ' CLICKED');
            }
        }
    }
    await delay(aleatorio(3000, 4000));

    //Change Date for this village
    if(document.getElementsByClassName('return-countdown') !== undefined){
        var timeRemaing = document.getElementsByClassName('return-countdown')[0].innerHTML.split(':'); //Penso que so rebenta se nao existirem tropas suficientes
        hrs = parseInt(timeRemaing[0]);
        min = parseInt(timeRemaing[1]);
        sec = parseInt(timeRemaing[2]);
    } else {
        hrs = 1;
        min = 0;
        sec = 0;
    }
    var newDateObj = new Date(Date.now() + hrs*3600000 + min*60000 + sec*100);
    processMap.set(JSON.stringify(atual), newDateObj);
    await GM_setValue('mapValues', Array.from(processMap.values()));
    changeVillage();
}



setTimeout(async function() {
    'use strict';
    var aux = document.getElementById('close_groups');
    if(aux !== undefined){
        aux.click();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Get Map
    var a;
    mapKeys = await GM_getValue('mapKeys');
    mapValues = await GM_getValue('mapValues');
    if(mapValues === undefined){ //Primeira vez a correr o script
        newMap();
        //console.log('Primeira vez a correr o script');
        await GM_setValue('mapKeys', Array.from(savedMap.keys()));
        await GM_setValue('mapValues', Array.from(savedMap.values()));
    } else { //Verificar se todas as aldeias no map sao as mesmas que estao em coordAldeiasAtacar (Verificar se nao existiu alteração nas aldeias a colectar)
        var coordsSaved = mapKeys;
        for(a = 0; a < coordAldeiasAtacar.length ;a++){
            if(coordAldeiasAtacar[a][0] != coordsSaved[a][0] || coordAldeiasAtacar[a][1] != coordsSaved[a][1] || coordAldeiasAtacar.length != coordsSaved.length){//Houve alteracao nas coordAldeiasAtacar
                console.log('Houve alteracao nas coordAldeiasAtacar');
                newMap();
                await GM_setValue('mapKeys', Array.from(savedMap.keys()));
                await GM_setValue('mapValues', Array.from(savedMap.values()));
                break;
            }
        }
    }
    mapKeys = await GM_getValue('mapKeys');
    mapValues = await GM_getValue('mapValues');

    processMap = new Map(); //Mapeia as coordenadas das aldeias para o tempo que a colheita acaba

    for(a = 0; a < mapKeys.length ;a++){
        processMap.set(JSON.stringify(mapKeys[a]), new Date(mapValues[a]));
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var aldeiaAtual = (document.querySelectorAll("b[class^='nowrap']"));
    var atual = aldeiaAtual[0].innerText;
    atual = atual.substring(1,8);
    atual = atual.split("|");
    atual[0] = Number(atual[0]);
    atual[1] = Number(atual[1]);

    var aldeiaEncontrada = 0;

    for(var i = 0; i < coordAldeiasAtacar.length; i++){
        if(coordAldeiasAtacar[i][0]==atual[0] && coordAldeiasAtacar[i][1]==atual[1]){
            aldeiaEncontrada = 1;
            break;
        }
    }
    if(aldeiaEncontrada == 0){
        await delay(aleatorio(200, 500));
        changeVillage();
        return;
    }

    await delay(aleatorio(200, 500));

    logica(atual);

}, 200);

//Funcao caso tenha existido algum erro
setTimeout(async function() {
    changeVillage();
}, 3600000); //Passado uma hora muda de aldeia


