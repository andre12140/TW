// ==UserScript==
// @name         Auto Farm A
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Para cima deles!
// @author       Barb
// @include      https://br110*screen=am_farm*
// @include      https://br110*screen=am_farm&Farm_page=0*
// @include      https://br110*screen=am_farm&Farm_page=0&group=0*
// @icon         https://i.imgur.com/p9B7h1l.png
// ==/UserScript==


//Colocar coordenadas das aldeias que são para farmar
var coordAldeiasAtacar = [
[442,533], //001
[426,524], //002
//[458,535], //003
//[443,528], //004
[462,530], //005
//[470,536], //006
//[474,540], //007
[406,574], //008
[442,531], //009
//[479,538], //010
//[474,539], //011
];

var switchVillage = 0; //0 -> switch to another village, 1 -> refresh current Vilage


var atual = "";
var distanciaMaxima = 20;

var nextVillageBTN;

var nextCoords = [];

const delay = ms => new Promise(res => setTimeout(res, ms));

function aleatorio(menor, maior) {
    var intervalo = Math.round(maior - menor);
    return Math.floor(Math.random() * intervalo) + menor + Timing.offset_to_server;
}

function altAldeia(){
    nextVillageBTN.click();
}

setTimeout(async function(){

    var aldeiaAtual = (document.querySelectorAll("b[class^='nowrap']"));
    atual = aldeiaAtual[0].innerText;
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
    if( i + 1 == coordAldeiasAtacar.length ){
        i = -1;
    }
    var index = i+1;

    document.getElementById('open_groups').click();

    await delay(aleatorio(300, 1000));

    var allVillages = document.getElementById('group_popup_content_container').firstElementChild.firstElementChild.getElementsByTagName('td');
    var coords = [];
    var foundVillage = 0;

    for(var k = 0; k < coordAldeiasAtacar.length; k++){

        nextCoords = coordAldeiasAtacar[index + k];
        if( index + k == coordAldeiasAtacar.length ){
            index = -k;
        }

        for(i = 1; i < allVillages.length; i=i+2){
            coords = allVillages[i].innerHTML.replaceAll(/\s/g,'').split('|');
            if(coords[0] == nextCoords[0] && coords[1] == nextCoords[1]){
                nextVillageBTN = allVillages[i-1].firstElementChild;
                foundVillage = 1;
                break;
            }
        }
        if(foundVillage = 1){
            break;
        }
    }

    if(foundVillage = 0){
        throw new Error("Stopped TamperMonkey script because no village found");
    }

    if(aldeiaEncontrada == 0){
        await delay(aleatorio(200, 500));
        altAldeia();
    }

    document.getElementById('close_groups').click();

    await delay(aleatorio(200, 500));

    var menu = document.getElementById('plunder_list').querySelectorAll("[class*=report_]");
    var distanciaCampos;

    //var buttonAtrops = $("input[size='3']"); //type="text"
    var buttonAtrops = $("input[type='text']");

    for( i = 0; i < buttonAtrops.length ; i++) {
        if(buttonAtrops[i].name.includes('knight')){
            break;
        }
    }
    var aTropsLength = i + 1;

    var tropsAvailable = document.getElementsByClassName('vis')[4].getElementsByClassName('unit-item'); //tropsAvailable[5].outerText Number of cls available

    var notEnoughTrops = 0;

    for (var j=0;j<100;j++){
        //Se tiver muralha ou o relatorio for vermelho nao ataca
        if((!(menu[j].children[6].innerHTML === '?') && parseInt(menu[j].children[6].innerHTML) > 0) || JSON.stringify(menu[j].children[1].getElementsByTagName('img')[0].outerHTML).includes('red')){
            continue;
        }

        distanciaCampos = parseInt(menu[j].children[7].outerText);
        tropsAvailable = document.getElementById('units_home').getElementsByClassName('unit-item');

        for(i = 0; i < aTropsLength; i++){
            if(parseInt(buttonAtrops[i].value) > parseInt(tropsAvailable[i].outerText)){
                notEnoughTrops = 1;
                break;
            }
        }

        if(distanciaCampos >= distanciaMaxima || notEnoughTrops){
            break;
        }

        //Verificar se veio full, se sim mandar C, se nao existir C mandar B
        if(menu[j].children[2].innerHTML.includes('1.png')){
            var cButton = menu[j].getElementsByClassName('farm_icon farm_icon_c');
            if(cButton.length != 0){
                console.log('Clicked button C');
                cButton[0].click();
            } else {
                await delay(aleatorio(300, 500));
                menu[j].getElementsByClassName('farm_icon farm_icon_b')[0].click();
                console.log('Clicked button B');
            }
            await delay(aleatorio(300, 800));
            continue;
        }

        await delay(aleatorio(300, 800));
        menu[j].getElementsByClassName('farm_icon farm_icon_a')[0].click();
    }
    await delay(aleatorio(500, 1500));
    if(!switchVillage){
        window.location.reload();
    }
    altAldeia();
}, aleatorio(500,1500));











