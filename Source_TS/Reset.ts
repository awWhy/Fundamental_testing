import { allowedToBeReset, checkTab } from './Check';
import { cloneArray, global, player, playerStart } from './Player';
import { autoResearchesSet, autoUpgradesSet, calculateMaxLevel, calculateResearchCost, assignBuildingInformation, autoElementsSet, assignMilestoneInformation, assignStrangeInfo, assignMaxRank, assignPuddles, assignTrueEnergy } from './Stage';
import { numbersUpdate, setRemnants, stageUpdate, switchTab, visualUpdate, visualUpdateResearches, visualUpdateUpgrades } from './Update';

export const reset = (type: 'discharge' | 'vaporization' | 'rank' | 'collapse' | 'galaxy', stageIndex: number[]) => {
    const { dischargeInfo } = global;
    const { energyStage, energyType } = dischargeInfo;
    const { buildings, discharge } = player;

    if (type === 'galaxy') {
        const { elements } = player;

        for (let i = 1; i < playerStart.elements.length; i++) {
            if (!allowedToBeReset(i, 4, 'elements')) { continue; }

            elements[i] = 0;
            visualUpdateUpgrades(i, 4, 'elements');
        }
        autoElementsSet();

        global.collapseInfo.pointsLoop = 0;
        player.collapse.mass = 0.01235;
        player.collapse.stars = [0, 0, 0];
    }

    let energyRefund = 0;
    for (const s of stageIndex) {
        if (s === 2) {
            global.vaporizationInfo.trueResearch0 = 0;
            global.vaporizationInfo.trueResearch1 = 0;
            global.vaporizationInfo.trueResearchRain = 0;
        } else if (s === 4) {
            global.collapseInfo.trueStars = 0;
        }
        energyRefund += energyStage[s];
        energyStage[s] = 0;

        const building = buildings[s];
        building[0].current.setValue(playerStart.buildings[s][0].current);
        building[0].total.setValue(playerStart.buildings[s][0].current);
        for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
            if (!allowedToBeReset(i, s, 'structures')) {
                if (!player.inflation.vacuum) { continue; }
                const energy = energyType[s][i] * building[i as 1].true;
                energyStage[s] += energy;
                energyRefund -= energy;
                continue;
            }

            building[i as 1].true = 0;
            building[i].current.setValue('0');
            building[i].total.setValue('0');
        }

        if (type === 'discharge') { continue; }
        const upgrades = player.upgrades[s];

        for (let i = 0; i < global.upgradesInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'upgrades')) { continue; }

            upgrades[i] = 0;
            visualUpdateUpgrades(i, s, 'upgrades');
        }
        autoUpgradesSet(s);

        if (type === 'vaporization') { continue; }
        const researches = player.researches[s];

        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'researches')) { continue; }

            researches[i] = 0;
            visualUpdateResearches(i, s, 'researches');
            calculateResearchCost(i, s, 'researches');
        }
        autoResearchesSet('researches', s);

        if (type === 'rank') { continue; }
        const researchesExtra = player.researchesExtra[s];

        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) {
            if (!allowedToBeReset(i, s, 'researchesExtra')) { continue; }

            researchesExtra[i] = 0;
            visualUpdateResearches(i, s, 'researchesExtra');
            calculateResearchCost(i, s, 'researchesExtra');
        }
        autoResearchesSet('researchesExtra', s);
        if (player.stage.active === 4) { setRemnants(); }
    }

    if (player.inflation.vacuum) {
        let deficit = dischargeInfo.energyTrue - discharge.energy - energyRefund;
        for (let s = 2; s <= 5; s++) {
            if (stageIndex.includes(s)) { continue; }
            const building = buildings[s];
            for (let i = global.buildingsInfo.maxActive[s] - 1; i >= 1; i--) {
                if (!allowedToBeReset(i, s, 'structures')) { continue; }

                if (deficit > 0) {
                    const max = Math.min(Math.ceil(deficit / energyType[s][i]), building[i as 1].true);
                    if (max > 0) {
                        building[i as 1].true -= max;
                        deficit -= max * energyType[s][i];
                        energyStage[s] -= max * energyType[s][i];
                        if (s === 4) { global.collapseInfo.trueStars -= max; }
                    }
                }
                building[i].current.setValue(building[i as 1].true);
                building[i].total.setValue(building[i as 1].true);
            }
            if (s !== 5) { //Stage 5 need to use trueStars (not included because its a fake stat)
                building[0].current.setValue(playerStart.buildings[s][0].current);
                building[0].total.setValue(playerStart.buildings[s][0].current);
            }
            if (s === 2) {
                global.vaporizationInfo.trueResearch0 = 0;
                global.vaporizationInfo.trueResearch1 = 0;
                global.vaporizationInfo.trueResearchRain = 0;
                assignPuddles();
            }
        }

        discharge.energy += deficit;
        dischargeInfo.energyTrue = discharge.energy;
    } else if (type === 'discharge') { //stageIndex.includes(1)
        discharge.energy = 0;
        dischargeInfo.energyTrue = 0;
    }

    assignBuildingInformation();
    if (!global.paused && stageIndex.includes(player.stage.active)) {
        visualUpdate();
        numbersUpdate();
    }
};

/** Default value for update is 'normal', default value for full is true and should be set to false only if Stage is permanent */
export const resetStage = (stageIndex: number[], update = true as null | boolean, full = true) => {
    for (const s of stageIndex) {
        const buildings = player.buildings[s];
        const buildingResetValue = playerStart.buildings[s][0].current;
        buildings[0].current.setValue(buildingResetValue);
        buildings[0].total.setValue(buildingResetValue);
        buildings[0].trueTotal.setValue(buildingResetValue);
        if (s < 6) {
            for (let i = 1; i < global.buildingsInfo.maxActive[s]; i++) {
                buildings[i as 1].true = 0;
                buildings[i].current.setValue('0');
                buildings[i].total.setValue('0');
                buildings[i].trueTotal.setValue('0');
            }
            global.dischargeInfo.energyStage[s] = 0;
        }

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        autoUpgradesSet(s);

        global.lastUpgrade[s][0] = null;
        if (s === 1) {
            if (player.strangeness[1][5] < 1) { player.ASR[1] = 0; }
            player.discharge.current = 0;
            player.discharge.energy = 0;
            global.dischargeInfo.energyTrue = 0;
        } else if (s === 2) {
            if (player.strangeness[2][5] < 1) { player.ASR[2] = 0; }
            global.vaporizationInfo.trueResearch0 = 0;
            global.vaporizationInfo.trueResearch1 = 0;
            global.vaporizationInfo.trueResearchRain = 0;
            player.vaporization.clouds.setValue('0');
        } else if (s === 3) {
            if (player.strangeness[3][5] < 1) { player.ASR[3] = 0; }
            if (player.inflation.vacuum) {
                player.accretion.rank = 1;
            } else {
                player.accretion.rank = 0;
                buildings[0].current.setValue('5.9722e27');
            }
        } else if (s === 4) {
            if (player.strangeness[4][5] < 1) { player.ASR[4] = 0; }
            global.collapseInfo.pointsLoop = 0;
            global.collapseInfo.trueStars = 0;
            player.collapse.mass = 0.01235;
            player.collapse.stars = [0, 0, 0];
            player.elements = cloneArray(playerStart.elements);
            player.elements[0] = player.strangeness[4][8] >= 1 ? 1 : 0;
            autoElementsSet();
            for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
            global.lastElement = null;
        } else if (s === 5) {
            if (player.strangeness[5][5] < 1) { player.ASR[5] = 0; }
            player.merge.reward = [0, 0, 0, 0];
            player.merge.resets = 0;
        }
    }

    for (const s of stageIndex) { //Less errors if do it separatly
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');

        autoResearchesSet('researches', s);
        autoResearchesSet('researchesExtra', s);
    }
    if (full) {
        const { strangeness, researchesAuto } = player;
        player.time.stage = 0;
        player.stage.time = 0;
        player.stage.peak = 0;
        global.debug.timeLimit = false;
        researchesAuto[0] = strangeness[3][6];
        researchesAuto[1] = strangeness[4][6];
        if (player.inflation.vacuum) {
            researchesAuto[2] = strangeness[1][4] < 1 ? 0 : strangeness[3][4] < 1 ? 1 : strangeness[2][4] < 1 ? 2 : strangeness[4][4] < 1 ? 3 : 4;
            for (let i = 0; i < playerStart.researchesAuto.length; i++) { visualUpdateResearches(i, 0, 'researchesAuto'); }
        } else {
            researchesAuto[2] = strangeness[Math.min(player.stage.current, 4)][4] >= 1 ? 1 : 0;
            visualUpdateResearches(2, 0, 'researchesAuto');
        }
    }

    assignBuildingInformation();
    if (update !== null) {
        switchTab(checkTab(global.tab) ? global.tab : 'stage');
        stageUpdate(update, true);
        if (!update) {
            const active = player.stage.active;
            for (let i = 0; i < global.upgradesInfo[active].maxActive; i++) { visualUpdateUpgrades(i, active, 'upgrades'); }
            if (player.stage.active === 4) { setRemnants(); }
        }
    }
};

export const resetVacuum = () => {
    const activeMilestone = global.milestonesInfoS6.active;
    for (let s = 1; s <= 6; s++) {
        const buildings = player.buildings[s];
        const buildingResetValue = playerStart.buildings[s][0].current;
        buildings[0].current.setValue(buildingResetValue);
        buildings[0].total.setValue(buildingResetValue);
        buildings[0].trueTotal.setValue(buildingResetValue);
        if (s < 6) {
            for (let i = 1; i < playerStart.buildings[s].length; i++) {
                buildings[i as 1].true = 0;
                buildings[i].current.setValue('0');
                buildings[i].total.setValue('0');
                buildings[i].trueTotal.setValue('0');
            }
            player.strangeness[s] = cloneArray(playerStart.strangeness[s]);
            player.milestones[s] = cloneArray(playerStart.milestones[s]);
            player.ASR[s] = 0;
        }

        player.upgrades[s] = cloneArray(playerStart.upgrades[s]);
        player.researches[s] = cloneArray(playerStart.researches[s]);
        player.researchesExtra[s] = cloneArray(playerStart.researchesExtra[s]);
        global.lastUpgrade[s][0] = null;
    }
    player.researchesAuto = cloneArray(playerStart.researchesAuto);

    //Stage 1
    player.discharge.energy = 0;
    player.discharge.energyMax = 0;
    player.discharge.current = 0;

    //Stage 2
    global.vaporizationInfo.trueResearch0 = 0;
    global.vaporizationInfo.trueResearch1 = 0;
    global.vaporizationInfo.trueResearchRain = 0;
    player.vaporization.clouds.setValue('0');
    player.vaporization.cloudsMax.setValue('0');

    //Stage 3
    if (player.inflation.vacuum) {
        player.accretion.rank = 1;
    } else {
        player.accretion.rank = 0;
        player.buildings[3][0].current.setValue('5.9722e27');
    }

    //Stage 4
    global.collapseInfo.pointsLoop = 0;
    global.collapseInfo.trueStars = 0;
    player.collapse.mass = 0.01235;
    player.collapse.massMax = 0.01235;
    player.collapse.stars = [0, 0, 0];
    player.elements = cloneArray(playerStart.elements);
    global.lastElement = null;

    //Stage 5 and Strangeness
    player.merge.resets = 0;
    player.merge.reward = [0, 0, 0, 0];
    player.challenges.void = cloneArray(player.challenges.superVoid);
    global.historyStorage.stage = [];
    player.history.stage.best = [3.1556952e16, 0, 0, 0];
    player.stage.current = 1;
    player.stage.resets = 0;
    player.stage.peak = 0;
    player.stage.time = 0;
    player.time.stage = 0;
    global.debug.timeLimit = false;
    global.lastStrangeness = [null, 0];
    global.lastMilestone = [null, 0];
    for (let i = 0; i < playerStart.strange.length; i++) {
        player.time.export[i + 1] = 0;
        player.strange[i].current = 0;
        player.strange[i].total = 0;
    }

    if (activeMilestone[0]) {
        const start = player.buildings[6][1].true;
        player.strange[0].current = start;
        player.strange[0].total = start;
        player.strangeness[1][8] = 2;
    }
    if (activeMilestone[1]) { player.strangeness[5][4] = 1; }
    if (activeMilestone[2]) {
        player.strangeness[3][6] = 3;
        player.strangeness[4][6] = 2;
        player.researchesAuto[0] = 3;
        player.researchesAuto[1] = 2;
    }

    assignBuildingInformation();
    assignStrangeInfo[1]();
    assignStrangeInfo[0]();
    assignMaxRank();
    assignTrueEnergy();
    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');
        if (activeMilestone[1]) {
            player.ASR[s] = global.ASRInfo.max[s];
            player.strangeness[s][5] = 1;
        }
        for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'strangeness'); }
        for (let i = 0; i < playerStart.milestones[s].length; i++) { assignMilestoneInformation(i, s); }
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) { calculateMaxLevel(i, 0, 'researchesAuto'); }
    for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
    autoUpgradesSet('all');
    autoResearchesSet('researches', 'all');
    autoResearchesSet('researchesExtra', 'all');
    autoElementsSet();

    switchTab(checkTab(global.tab) ? global.tab : 'stage');
    stageUpdate(true, true);
};

export const cloneBeforeReset = (depth: 'stage' | 'vacuum') => {
    const { clone } = player;
    clone.depth = depth;

    clone.buildings = [[]];
    clone.upgrades = [[]];
    clone.researches = [[]];
    clone.researchesExtra = [[]];
    clone.ASR = [0];
    if (depth !== 'stage') {
        clone.strangeness = [];
        clone.milestones = [];
    }
    for (let s = 1; s <= 6; s++) {
        const buildings = player.buildings[s];
        clone.buildings[s] = [{
            current: buildings[0].current.toString(),
            total: buildings[0].total.toString(),
            trueTotal: buildings[0].trueTotal.toString()
        }];
        if (s < 6) {
            for (let i = 1; i < buildings.length; i++) {
                clone.buildings[s][i] = {
                    true: buildings[i as 1].true,
                    current: buildings[i].current.toString(),
                    total: buildings[i].total.toString(),
                    trueTotal: buildings[i].trueTotal.toString()
                };
            }
            clone.ASR[s] = player.ASR[s];
            if (depth !== 'stage') {
                clone.strangeness[s] = cloneArray(player.strangeness[s]);
                clone.milestones[s] = cloneArray(player.milestones[s]);
            }
        }
        clone.upgrades[s] = cloneArray(player.upgrades[s]);
        clone.researches[s] = cloneArray(player.researches[s]);
        clone.researchesExtra[s] = cloneArray(player.researchesExtra[s]);
    }
    clone.stage = {
        current: player.stage.current,
        time: player.stage.time,
        peak: player.stage.peak
    };
    clone.time = {
        stage: player.time.stage
    };
    clone.researchesAuto = cloneArray(player.researchesAuto);

    clone.discharge = {
        current: player.discharge.current,
        energy: player.discharge.energy
    };
    clone.vaporization = {
        clouds: player.vaporization.clouds.toString()
    };
    clone.accretion = {
        rank: player.accretion.rank
    };
    clone.collapse = {
        mass: player.collapse.mass,
        stars: cloneArray(player.collapse.stars)
    };
    clone.elements = cloneArray(player.elements);
    clone.merge = {
        reward: cloneArray(player.merge.reward),
        resets: player.merge.resets
    };
    if (depth !== 'stage') {
        clone.strange = [];
        clone.time.export = [player.time.export[0]];
        for (let i = 0; i < player.strange.length; i++) {
            clone.time.export[i + 1] = player.time.export[i + 1];
            clone.strange[i] = {
                current: player.strange[i].current,
                total: player.strange[i].total
            };
        }
        clone.history = {
            stage: {
                list: global.historyStorage.stage.slice(0, player.history.stage.input[0]),
                best: cloneArray(player.history.stage.best)
            }
        };
        clone.challenges = {
            void: cloneArray(player.challenges.void)
        };
        clone.inflation = {
            age: player.inflation.age
        };
        clone.stage.resets = player.stage.resets;
        clone.time.universe = player.time.universe;
        clone.discharge.energyMax = player.discharge.energyMax;
        clone.vaporization.cloudsMax = player.vaporization.cloudsMax.toString();
        clone.collapse.massMax = player.collapse.massMax;
    }
};

export const loadFromClone = () => {
    const { clone } = player;
    const depth = clone.depth;

    for (let s = 1; s <= 6; s++) {
        const buildings = player.buildings[s];
        const buildingsClone = clone.buildings[s];

        buildings[0].current.setValue(buildingsClone[0].current);
        buildings[0].total.setValue(buildingsClone[0].total);
        buildings[0].trueTotal.setValue(buildingsClone[0].trueTotal);
        if (s < 6) {
            for (let i = 1; i < buildingsClone.length; i++) {
                buildings[i as 1].true = buildingsClone[i].true;
                buildings[i].current.setValue(buildingsClone[i].current);
                buildings[i].total.setValue(buildingsClone[i].total);
                buildings[i].trueTotal.setValue(buildingsClone[i].trueTotal);
            }
            player.ASR[s] = clone.ASR[s];
            if (depth !== 'stage') {
                player.strangeness[s] = clone.strangeness[s];
                player.milestones[s] = clone.milestones[s];
            }
        }

        player.upgrades[s] = clone.upgrades[s];
        player.researches[s] = clone.researches[s];
        player.researchesExtra[s] = clone.researchesExtra[s];
        global.lastUpgrade[s][0] = null;
    }
    player.researchesAuto = clone.researchesAuto;
    player.stage.current = clone.stage.current;
    player.stage.time = clone.stage.time;
    player.stage.peak = clone.stage.peak;
    player.time.stage = clone.time.stage;
    global.debug.timeLimit = false;

    player.discharge.current = clone.discharge.current;
    player.discharge.energy = clone.discharge.energy;
    global.vaporizationInfo.trueResearch0 = 0;
    global.vaporizationInfo.trueResearch1 = 0;
    global.vaporizationInfo.trueResearchRain = 0;
    player.vaporization.clouds.setValue(clone.vaporization.clouds);
    player.accretion.rank = clone.accretion.rank;
    const trueStars = clone.buildings[4];
    global.collapseInfo.trueStars = trueStars[1].true + trueStars[2].true + trueStars[3].true + trueStars[4].true + trueStars[5].true;
    global.collapseInfo.pointsLoop = 0;
    player.collapse.mass = clone.collapse.mass;
    player.collapse.stars = clone.collapse.stars;
    player.elements = clone.elements;
    global.lastElement = null;
    player.merge.reward = clone.merge.reward;
    player.merge.resets = clone.merge.resets;

    if (depth !== 'stage') {
        for (let i = 0; i < clone.strange.length; i++) {
            player.time.export[i + 1] = clone.time.export[i + 1];
            player.strange[i].current = clone.strange[i].current;
            player.strange[i].total = clone.strange[i].total;
        }
        player.stage.resets = clone.stage.resets;
        player.time.universe = clone.time.universe;
        player.time.export[0] += clone.time.export[0];
        player.inflation.age = clone.inflation.age;
        global.historyStorage.stage = clone.history.stage.list;
        player.history.stage.best = clone.history.stage.best;
        player.challenges.void = clone.challenges.void;
        player.discharge.energyMax = clone.discharge.energyMax;
        player.vaporization.cloudsMax.setValue(clone.vaporization.cloudsMax);
        player.collapse.massMax = clone.collapse.massMax;
        global.lastStrangeness = [null, 0];
        global.lastMilestone = [null, 0];
    }

    assignBuildingInformation();
    assignTrueEnergy();
    if (depth !== 'stage') {
        assignStrangeInfo[1]();
        assignStrangeInfo[0]();
        assignMaxRank();
    }
    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researches'); }
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'researchesExtra'); }
        calculateMaxLevel(0, s, 'ASR');
        if (depth !== 'stage') {
            for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) { calculateMaxLevel(i, s, 'strangeness'); }
            for (let i = 0; i < playerStart.milestones[s].length; i++) { assignMilestoneInformation(i, s); }
        }
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) { visualUpdateResearches(i, 0, 'researchesAuto'); }
    for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }

    autoUpgradesSet('all');
    autoResearchesSet('researches', 'all');
    autoResearchesSet('researchesExtra', 'all');
    autoElementsSet();

    switchTab(checkTab(global.tab) ? global.tab : 'stage');
    stageUpdate(true, true);
    player.clone = {};
};
