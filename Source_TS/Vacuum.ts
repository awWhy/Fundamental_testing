import { getId, getQuery } from './Main';
import { global, player, playerStart } from './Player';
import { resetVacuum } from './Reset';
import { globalSave, playEvent, specialHTML } from './Special';
import { switchTab } from './Update';

export const prepareVacuum = (state: boolean) => { //Must not use direct player values
    const { buildings } = playerStart;
    const { buildingsInfo, upgradesInfo, researchesInfo, researchesExtraInfo, strangenessInfo } = global;
    const star3ExpId = getId('star3Explanation');
    let buildingsActive, upgrades1Cost, researches1Cost, researches1Scaling, strangeness1Cost, strangeness1Scaling, strangeness2Cost, strangeness2Scaling, strangeness3Cost, strangeness3Scaling, strangeness4Cost, strangeness4Scaling, strangeness5Cost, strangeness5Scaling;

    if (state) {
        getId('mergeResetText').innerHTML = '<span class="cyanText">Merge</span> does a <span class="grayText">Galaxy</span> reset, while also converting self-made <span class="grayText">Galaxies</span> into non self-made.';
        specialHTML.footerStatsHTML[1][0] = ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'];
        buildingsInfo.hoverText[2][0] = 'Tritium';
        buildingsInfo.hoverText[3][0] = 'Preons hardcap';
        buildings[1][0].current.setValue('5.476e-3');
        buildings[2][0].current.setValue('0');
        buildings[3][0].current.setValue('9.76185667392e-36');
        buildingsActive = [6, 7, 6, 6, 4];
        if (buildingsInfo.name[1][0] !== 'Mass') {
            specialHTML.buildingHTML[1].unshift('Preon.png', 'Quarks.png');
            buildingsInfo.name[1].unshift('Mass', 'Preons');
            buildingsInfo.hoverText[1].unshift('Mass', 'Preons');
        }
        buildingsInfo.startCost[1] = [0, 0.005476, 6, 3, 24, 3];
        buildingsInfo.type[2][1] = 'improving';
        buildingsInfo.type[3][1] = 'delaying';
        star3ExpId.textContent = 'Boost to Solar mass gain and delay to Preons hardcap';

        upgrades1Cost = [40, 60, 100, 120, 180, 360, 1200, 3600, 12000, 80000];
        upgradesInfo[2].startCost[0] = 10;
        upgradesInfo[5].startCost[3] = 1e160;
        //upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 9;
        //upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 5;
        //upgradesInfo[5].maxActive = 4;

        researches1Cost = [1600, 4800, 16000, 32000, 16000, 24000];
        researches1Scaling = [400, 1200, 8000, 40000, 16000, 16000];
        researchesInfo[2].scaling[2] = 1e2;
        researchesInfo[2].scaling[3] = 1e3;
        //researchesInfo[1].maxActive = 6;
        //researchesInfo[2].maxActive = 6;
        //researchesInfo[3].maxActive = 9;
        researchesInfo[4].maxActive = 6;
        //researchesInfo[5].maxActive = 2;

        researchesExtraInfo[1].maxActive = 5;
        researchesExtraInfo[2].maxActive = 4;
        researchesExtraInfo[3].maxActive = 5;
        researchesExtraInfo[4].maxActive = 4;
        //researchesExtraInfo[5].maxActive = 1;

        global.elementsInfo.startCost[27] = 1e54;
        global.elementsInfo.startCost[28] = 1e58;

        global.ASRInfo.costRange[1] = [2000, 8000, 16000, 32000, 56000];
        global.ASRInfo.costRange[3][3] = 2.45576045e31;

        strangeness1Cost = [1, 1, 1, 2, 12, 2, 24];
        strangeness1Scaling = [2.46, 2, 6, 6, 100, 1, 1];
        strangeness2Cost = [1, 1, 2, 2, 12, 4, 24];
        strangeness2Scaling = [2.46, 2, 3, 3.4, 800, 1, 1];
        strangeness3Cost = [1, 2, 2, 24, 12, 4, 4, 24];
        strangeness3Scaling = [2, 3.4, 3, 1, 400, 1, 1.74, 1];
        strangeness4Cost = [1, 2, 4, 2, 12, 6, 6, 24];
        strangeness4Scaling = [2, 3.4, 3, 6, 1900, 1, 1.74, 1];
        strangeness5Cost = [24, 36, 6, 24, 15600, 24, 96, 120];
        strangeness5Scaling = [2, 2, 3.4, 1, 1, 1, 1, 1];
        strangenessInfo[1].maxActive = 10;
        strangenessInfo[2].maxActive = 10;
        strangenessInfo[3].maxActive = 10;
        strangenessInfo[4].maxActive = 10;
        strangenessInfo[5].maxActive = 9;

        getQuery('#stageHistory > h4').textContent = 'Stage resets:';

        getId('preonCap').style.display = '';
        getId('molesProduction').style.display = '';
        getId('massProduction').style.display = '';
        getId('dustCap').style.display = '';
        getId('solarMassCollapseMaxMain').style.display = '';
        getId('element0').style.display = '';
        getId('strange7Stage1').style.display = '';
        getId('strange7Stage2').style.display = '';
        getId('strange8Stage3').style.display = '';
        getId('strange8Stage4').style.display = '';
        getId('strange3Stage5').style.display = '';
        getId('strange4Stage5').style.display = '';
        getId('collapseCapped').style.display = '';
        getId('stageInstant').style.display = 'none';
    } else {
        specialHTML.footerStatsHTML[1][0] = ['Quarks.png', 'stage1borderImage cyanText', 'Quarks'];
        buildingsInfo.hoverText[2][0] = 'Moles';
        buildingsInfo.hoverText[3][0] = 'Mass';
        buildings[1][0].current.setValue('3');
        buildings[2][0].current.setValue('2.7753108348135e-3');
        buildings[3][0].current.setValue('1e-19');
        if (buildingsInfo.name[1][0] === 'Mass') {
            specialHTML.buildingHTML[1].splice(0, 2);
            buildingsInfo.name[1].splice(0, 2);
            buildingsInfo.hoverText[1].splice(0, 2);
        }
        buildingsActive = [4, 6, 5, 5, 4];
        buildingsInfo.startCost[1] = [0, 3, 24, 3];
        buildingsInfo.type[2][1] = 'producing';
        buildingsInfo.type[3][1] = 'producing';
        star3ExpId.textContent = 'Boost to Solar mass gain';

        upgrades1Cost = [0, 0, 12, 36, 120, 240, 480, 1600, 3200, 20800];
        upgradesInfo[2].startCost[0] = 1e4;
        upgradesInfo[5].startCost[3] = 1e150;
        upgradesInfo[1].maxActive = 10;
        upgradesInfo[2].maxActive = 8;
        upgradesInfo[3].maxActive = 13;
        upgradesInfo[4].maxActive = 4;
        upgradesInfo[5].maxActive = 4;

        researches1Cost = [600, 2000, 4000, 4000, 6000, 6000];
        researches1Scaling = [200, 400, 2000, 12000, 4000, 6000];
        researchesInfo[2].scaling[2] = 1e3;
        researchesInfo[2].scaling[3] = 1e2;
        researchesInfo[1].maxActive = 6;
        researchesInfo[2].maxActive = 6;
        researchesInfo[3].maxActive = 9;
        researchesInfo[4].maxActive = 5;
        researchesInfo[5].maxActive = 2;

        researchesExtraInfo[1].maxActive = 0;
        researchesExtraInfo[2].maxActive = 3;
        researchesExtraInfo[3].maxActive = 4;
        researchesExtraInfo[4].maxActive = 3;
        researchesExtraInfo[5].maxActive = 1;

        global.elementsInfo.startCost[27] = 1e52;
        global.elementsInfo.startCost[28] = 1e54;

        global.ASRInfo.costRange[1] = [2000, 8000, 16000];
        global.ASRInfo.costRange[3][3] = 2e30;

        strangeness1Cost = [1, 1, 1, 2, 4, 2, 24];
        strangeness1Scaling = [1, 0.75, 1.5, 3, 0, 0, 0];
        strangeness2Cost = [1, 1, 2, 2, 4, 2, 24];
        strangeness2Scaling = [0.5, 0.75, 2, 2, 0, 0, 0];
        strangeness3Cost = [1, 1, 2, 6, 4, 2, 6, 24];
        strangeness3Scaling = [0.75, 1.5, 2, 0, 0, 0, 3, 0];
        strangeness4Cost = [1, 1, 3, 2, 4, 2, 4, 24];
        strangeness4Scaling = [1, 2, 2.5, 2, 0, 0, 68, 0];
        strangeness5Cost = [20, 24, 240, 24, 6000, 24, 20, 120];
        strangeness5Scaling = [20, 24, 240, 0, 0, 0, 220, 0];
        strangenessInfo[1].maxActive = 7;
        strangenessInfo[2].maxActive = 7;
        strangenessInfo[3].maxActive = 8;
        strangenessInfo[4].maxActive = 8;
        strangenessInfo[5].maxActive = 8;

        getQuery('#stageHistory > h4').textContent = 'Interstellar Stage resets:';

        getId('strange8Stage5').style.display = '';
        getId('milestonesProgressArea').style.display = '';
        getId('stageInstant').style.display = '';
        getId('rankStat0').style.display = '';

        getId('preonCap').style.display = 'none';
        getId('molesProduction').style.display = 'none';
        getId('massProduction').style.display = 'none';
        getId('dustCap').style.display = 'none';
        getId('submersionBoost').style.display = 'none';
        getId('mainCap').style.display = 'none';
        getId('solarMassCollapseMaxMain').style.display = 'none';
        getId('researchAuto1').style.display = 'none';
        getId('researchAuto2').style.display = 'none';
        getId('collapseCapped').style.display = 'none';
        getId('element0').style.display = 'none';
        for (let s = 1; s < strangenessInfo.length; s++) {
            for (let i = strangenessInfo[s].maxActive + 1; i <= strangenessInfo[s].startCost.length; i++) {
                getId(`strange${i}Stage${s}`).style.display = 'none';
            }
        }
    }

    buildingsInfo.maxActive.splice(1, buildingsActive.length, ...buildingsActive);
    upgradesInfo[1].startCost.splice(0, upgrades1Cost.length, ...upgrades1Cost);
    researchesInfo[1].startCost.splice(0, researches1Cost.length, ...researches1Cost);
    researchesInfo[1].scaling.splice(0, researches1Scaling.length, ...researches1Scaling);
    strangenessInfo[1].startCost.splice(0, strangeness1Cost.length, ...strangeness1Cost);
    strangenessInfo[1].scaling.splice(0, strangeness1Scaling.length, ...strangeness1Scaling);
    strangenessInfo[2].startCost.splice(0, strangeness2Cost.length, ...strangeness2Cost);
    strangenessInfo[2].scaling.splice(0, strangeness2Scaling.length, ...strangeness2Scaling);
    strangenessInfo[3].startCost.splice(0, strangeness3Cost.length, ...strangeness3Cost);
    strangenessInfo[3].scaling.splice(0, strangeness3Scaling.length, ...strangeness3Scaling);
    strangenessInfo[4].startCost.splice(0, strangeness4Cost.length, ...strangeness4Cost);
    strangenessInfo[4].scaling.splice(0, strangeness4Scaling.length, ...strangeness4Scaling);
    strangenessInfo[5].startCost.splice(0, strangeness5Cost.length, ...strangeness5Cost);
    strangenessInfo[5].scaling.splice(0, strangeness5Scaling.length, ...strangeness5Scaling);
    if (globalSave.SRSettings[0]) { star3ExpId.textContent = ` (${star3ExpId.textContent})`; }
    for (let s = 1; s <= 3; s++) {
        const newValue = buildings[s][0].current;
        buildings[s][0].total.setValue(newValue);
        buildings[s][0].trueTotal.setValue(newValue);
    }
};

export const switchVacuum = () => {
    if (player.inflation.vacuum) { return; }
    if (player.stage.true >= 7) {
        player.inflation.cosmon += 1;
    } else {
        player.stage.true = 6;
        player.collapse.show = 0;
        switchTab('stage', 'Structures');
        playEvent(6);
    }
    player.inflation.vacuum = true;
    prepareVacuum(true);
    resetVacuum();
};
