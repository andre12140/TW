// ==UserScript==
// @name         Cultivador de BBs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Para cima deles!
// @author       Barb
// @include      https://**.tribalwars.com.*/game.php?**&screen=report&mode=*&group_id=*
// @include      https://**.tribalwars.com.*/game.php?**&screen=report&mode=*
// @include      https://**.tribalwars.com.*/game.php?**&screen=place*
// @include      https://**.tribalwars.com.*/game.php?screen=place&village=*
// @include      https://**.tribalwars.com.*/game.php?village=*&screen=report&mode=*&group_id=*&view=*
// @icon         https://i.imgur.com/p9B7h1l.png
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

const delay = ms => new Promise(res => setTimeout(res, ms));

function aleatorio(menor, maior) {
    var intervalo = Math.round(maior - menor);
    return Math.floor(Math.random() * intervalo) + menor + Timing.offset_to_server;
}

function getNCatas(buildingLevel){
    if (buildingLevel > 13){
        return 6;
    } else if(buildingLevel > 11){
        return 5;
    } else if(buildingLevel > 8){
        return 4;
    } else if(buildingLevel > 3){
        return 3;
    } else if(buildingLevel > 0){
        return 2;
    } else if(buildingLevel == 0){
        return 0;
    }
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

var wallLevel = 0;
var epLevel = 0;
var mercLevel = 0;
var quartelLevel = 0;
var ferrLevel = 0;

var attackBuilding = 0;

setTimeout(async function() {
    'use strict';

    var icon = document.getElementById('favicon');
    icon.href = 'https://i.imgur.com/p9B7h1l.png';

    var aux = document.getElementsByClassName('quickedit-label');

    if(aux.length > 0 && aux[0].outerText.split(' ').indexOf("exploradores") > -1 && document.getElementById('attack_info_def').firstElementChild.firstElementChild.lastElementChild.innerHTML === '---'){

        var buildings = document.getElementById('attack_spy_buildings_left').getElementsByClassName('middle');

        for (var i = 0; i < buildings.length; i++){
            if (buildings[i].innerHTML === 'Edifício principal'){
                epLevel = parseInt(buildings[i+1].innerHTML);
            } else if(buildings[i].innerHTML === 'Quartel'){
                quartelLevel = parseInt(buildings[i+1].innerHTML);
            } else if(buildings[i].innerHTML === 'Mercado'){
                mercLevel = parseInt(buildings[i+1].innerHTML);
            } else if(buildings[i].innerHTML === 'Ferreiro'){
                ferrLevel = parseInt(buildings[i+1].innerHTML);
            }
        }


        //Verificar se existe muralha. Alterar para se detetar muralha destruir primeiro com arietes e depois enviar catas
        var buildingsRigth = document.getElementById('attack_spy_buildings_right').getElementsByClassName('middle');
        for (i = 0; i < buildingsRigth.length; i++){
            if(buildingsRigth[i].innerHTML === 'Muralha'){
                wallLevel = parseInt(buildingsRigth[i+1].innerHTML);
                break;
            }
        }

        var TargetLink = $("a:contains('Atacar esta aldeia.')");

        await GM_setValue('wallLevel', wallLevel);
        await GM_setValue('epLevel', epLevel);
        await GM_setValue('mercLevel', mercLevel);
        await GM_setValue('quartelLevel', quartelLevel);
        await GM_setValue('ferrLevel', ferrLevel);

        await GM_setValue('Processing', 1);

        var villageAttack = document.getElementsByClassName('village_anchor contexted')[0].getAttribute('data-id');

        var redirectLink = TargetLink[0].href;
        var redirectLink1 = redirectLink.substring(0, redirectLink.search('village=') + 8);
        var redirectLink2 = redirectLink.substring(redirectLink.search('&screen='), redirectLink.length);
        redirectLink = redirectLink1.concat(villageAttack).concat(redirectLink2);

        await GM_setValue('redirectLink', redirectLink);

        await delay(aleatorio(300, 1000));
        window.location.href = redirectLink;
    }

    if(await GM_getValue('Processing') == 1 && window.location.href.indexOf("target=") > -1){

        wallLevel = await GM_getValue('wallLevel');
        epLevel = await GM_getValue('epLevel');
        quartelLevel = await GM_getValue('quartelLevel');
        mercLevel = await GM_getValue('mercLevel');
        ferrLevel = await GM_getValue('ferrLevel');

        var esploradores = document.getElementsByName("spy")[0];
        var catas = document.getElementsByName("catapult")[0];
        var ram = document.getElementsByName("ram")[0];
        var axe = document.getElementsByName("axe")[0];

        var spyLeft = parseInt((document.getElementById('units_entry_all_spy').innerHTML).replace('(','').replace(')',''));
        var catasLeft = parseInt((document.getElementById('units_entry_all_catapult').innerHTML).replace('(','').replace(')',''));
        var ramLeft = parseInt((document.getElementById('units_entry_all_ram').innerHTML).replace('(','').replace(')',''));
        var axeLeft = parseInt((document.getElementById('units_entry_all_axe').innerHTML).replace('(','').replace(')',''));

        var nCatas = 0;

        if(wallLevel > 0){
            attackBuilding = 5;
            ram.value = 10;
            axe.value = 10;
            await GM_setValue('wallLevel', wallLevel-2);
        }else if(epLevel > 1) {
            attackBuilding = 1;
            nCatas = getNCatas(epLevel);
            await GM_setValue('epLevel', epLevel-1);
        } else if (quartelLevel != 0){
            attackBuilding = 2;
            nCatas = getNCatas(quartelLevel);
            await GM_setValue('quartelLevel', quartelLevel-1);
        } else if (mercLevel != 0){
            attackBuilding = 3;
            nCatas = getNCatas(mercLevel);
            await GM_setValue('mercLevel', mercLevel-1);
        } else if (ferrLevel != 0){
            attackBuilding = 4;
            nCatas = getNCatas(ferrLevel);
            await GM_setValue('ferrLevel', ferrLevel-1);
        } else { //All buildings are destroyed
            alert('BB cultivated');
            await GM_setValue('Processing', 0);
            return
        }

        await GM_setValue('attackBuilding', attackBuilding);

        if((attackBuilding != 5 && (spyLeft < 1 || nCatas > catasLeft)) || (attackBuilding == 5 && (ramLeft < 10 || axeLeft < 10))){
            await GM_setValue('Processing', 0);
            alert('Not enough troops');
            return
        }

        esploradores.value = 1;
        catas.value = nCatas;

        await GM_setValue('Processing', 2);

        await delay(aleatorio(300, 1000));

        //Click Attack
        buscarObjeto('input.attack.btn.btn-attack.btn-target-action')[0].click();

    }

    if(await GM_getValue('Processing') == 3){ //redirect to Processing 1

        var rediLink = await GM_getValue('redirectLink');
        await GM_setValue('Processing', 1);
        await delay(aleatorio(300, 1000));
        window.location.href = rediLink;

    }

    if(await GM_getValue('Processing') == 2 && window.location.href.indexOf("try=confirm") > -1){

        await GM_setValue('Processing', 3);

        attackBuilding = await GM_getValue('attackBuilding');

        if(attackBuilding == 1){
            $("select[name=building]").val("main");
        } else if (attackBuilding == 2){
            $("select[name=building]").val("barracks");
        } else if (attackBuilding == 3){
            $("select[name=building]").val("market");
        } else if (attackBuilding == 4){
            $("select[name=building]").val("smith");
        } else if(attackBuilding != 5){
            alert('Something went wrong');
            await GM_setValue('Processing', 0);
            return
        }

        await delay(aleatorio(300, 1000));
        buscarObjeto('input.troop_confirm_go.btn.btn-attack')[0].click();

    }



}, 200);













