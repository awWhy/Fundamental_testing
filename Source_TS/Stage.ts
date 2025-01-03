import { checkBuilding, checkUpgrade, milestoneCheck } from './Check';
import Overlimit from './Limit';
import { getId, simulateOffline } from './Main';
import { global, logAny, player, playerStart } from './Player';
import { cloneBeforeReset, loadFromClone, reset, resetStage, resetVacuum } from './Reset';
import { Confirm, Notify, globalSave, playEvent } from './Special';
import { format, numbersUpdate, setRemnants, stageUpdate, switchTab, visualTrueStageUnlocks, visualUpdate, visualUpdateInflation, visualUpdateResearches, visualUpdateUpgrades } from './Update';
import { prepareVacuum, switchVacuum } from './Vacuum';

/** Normal game tick */
export const timeUpdate = (timeWarp = 0, tick = globalSave.intervals.offline / 1000) => {
    const { time, ASR } = player;
    const { auto, buildings: autoBuy } = player.toggles;
    const { maxActive } = global.buildingsInfo;
    const { autoU, autoR, autoE } = global.automatization;
    const activeAll = global.stageInfo.activeAll;
    const vacuum = player.inflation.vacuum;

    let passedSeconds: number;
    if (timeWarp > 0) {
        const extraTime = Math.min(tick, timeWarp);
        passedSeconds = extraTime;
        timeWarp -= extraTime;
    } else {
        const currentTime = Date.now();
        passedSeconds = (currentTime - time.updated) / 1000;
        time.updated = currentTime;
        time.export[0] += passedSeconds;
        global.lastSave += passedSeconds;
        if (passedSeconds > tick) {
            if (passedSeconds > tick * 600) { return void simulateOffline(passedSeconds); }
            timeWarp = passedSeconds - tick;
            passedSeconds = tick;
        } else if (passedSeconds <= 0) {
            time.offline += passedSeconds;
            return;
        }
        time.online += passedSeconds;
    }
    const trueSeconds = passedSeconds;
    time.stage += trueSeconds;
    time.universe += trueSeconds;

    assignGlobalSpeed();
    passedSeconds *= global.inflationInfo.globalSpeed;

    player.stage.time += passedSeconds;
    player.inflation.age += passedSeconds;

    if (player.toggles.normal[3]) { exitChallengeAuto(); }
    if (vacuum || activeAll.includes(4)) { stageResetCheck(5, trueSeconds); }
    assignBuildingsProduction.multipliersAll();
    if (activeAll.includes(6)) {
        gainBuildings(0, 6, passedSeconds); //Dark matter
    }
    if (activeAll.includes(5)) {
        if (player.strangeness[5][3] >= 1 || global.milestonesInfoS6.active[2]) {
            if (autoU[5].length !== 0) { autoUpgradesBuy(5); }
            if (autoR[5].length !== 0) { autoResearchesBuy('researches', 5); }
            if (autoE[5].length !== 0) { autoResearchesBuy('researchesExtra', 5); }
        }
        for (let i = maxActive[5] - 1; i >= 1; i--) {
            if (autoBuy[5][i] && ASR[5] >= i) { buyBuilding(i, 5, 0, true); }
        }
        assignBuildingsProduction.multipliersStage5();
        gainBuildings(0, 5, passedSeconds); //Brown dwarfs
        const research = player.researches[5][0];
        if (research >= 1) { gainBuildings(1, 5, passedSeconds); } //Main sequence
        if (research >= 2) { gainBuildings(2, 5, passedSeconds); } //Red supergiants
        if (research >= 3) { gainBuildings(3, 5, passedSeconds); } //Blue hypergiants
        if (research >= 4 && (player.challenges.active !== 0 || player.inflation.tree[3] >= 1)) { gainBuildings(4, 5, passedSeconds); } //Quasi-stars
    } else if (activeAll.includes(4)) { assignBuildingsProduction.multipliersStage5(); }
    if (activeAll.includes(4)) {
        if (global.automatization.elements.length !== 0) { autoElementsBuy(); }
        if (autoU[4].length !== 0) { autoUpgradesBuy(4); }
        if (autoR[4].length !== 0) { autoResearchesBuy('researches', 4); }
        if (autoE[4].length !== 0) { autoResearchesBuy('researchesExtra', 4); }
        assignBuildingsProduction.multipliersStage4();
        for (let i = maxActive[4] - 1; i >= 1; i--) {
            if (autoBuy[4][i] && ASR[4] >= i) { buyBuilding(i, 4, 0, true); }
            gainBuildings(i - 1, 4, passedSeconds); //Elements
        }
        awardMilestone(0, 5);
        awardMilestone(0, 4);
        collapseResetCheck(true);
        awardMilestone(1, 4);
    }
    if (activeAll.includes(3)) {
        if (!vacuum && auto[0]) { stageResetCheck(3, 0); }
        if (auto[3]) { rankResetCheck(true); }
        if (autoU[3].length !== 0) { autoUpgradesBuy(3); }
        if (autoR[3].length !== 0) { autoResearchesBuy('researches', 3); }
        if (autoE[3].length !== 0) { autoResearchesBuy('researchesExtra', 3); }
        assignBuildingsProduction.multipliersStage3(); //Auto updates
        if (vacuum) {
            assignSharedHardcapDelays();
            assignDustHardcap();
            global.accretionInfo.disableAuto = player.strangeness[1][8] >= 2 && assignBuildingsProduction.S3Build1(true).moreOrEqual(global.inflationInfo.dustCap);
            if (global.accretionInfo.disableAuto) { assignSolarMassHardcap(); }
        }
        for (let i = 1; i < maxActive[3]; i++) {
            if (autoBuy[3][i] && ASR[3] >= i) { buyBuilding(i, 3, 0, true); }
        }
        gainBuildings(2, 3, passedSeconds); //Planetesimals
        gainBuildings(1, 3, passedSeconds); //Cosmic dust
        if (!vacuum) { gainBuildings(0, 3, passedSeconds); } //Mass
    } else if (vacuum) { assignSharedHardcapDelays(); }
    if (activeAll.includes(2)) {
        if (!vacuum && auto[0]) { stageResetCheck(2, 0); }
        vaporizationResetCheck(trueSeconds);
        if (autoU[2].length !== 0) { autoUpgradesBuy(2); }
        if (autoR[2].length !== 0) { autoResearchesBuy('researches', 2); }
        if (autoE[2].length !== 0) { autoResearchesBuy('researchesExtra', 2); }
        for (let i = maxActive[2] - 1; i >= 1; i--) {
            if (autoBuy[2][i] && ASR[2] >= i) { buyBuilding(i, 2, 0, true); }
        }
        gainBuildings(1, 2, passedSeconds); //Drops
        if (!vacuum) { gainBuildings(0, 2, passedSeconds); } //Moles
        awardMilestone(1, 2);
        awardMilestone(0, 2);
    }
    if (activeAll.includes(1)) {
        if (!vacuum && auto[0]) { stageResetCheck(1, 0); }
        if (autoU[1].length !== 0) { autoUpgradesBuy(1); }
        if (autoR[1].length !== 0) { autoResearchesBuy('researches', 1); }
        if (autoE[1].length !== 0) { autoResearchesBuy('researchesExtra', 1); }
        assignBuildingsProduction.multipliersStage1();
        if (player.upgrades[1][8] === 1) { gainBuildings(5, 1, passedSeconds); } //Molecules
        for (let i = maxActive[1] - 1; i >= 1; i--) {
            if (autoBuy[1][i] && ASR[1] >= i) { buyBuilding(i, 1, 0, true); }
            gainBuildings(i - 1, 1, passedSeconds); //Rest of Microworld
        }
        awardMilestone(1, 1);
        awardMilestone(0, 1);
        dischargeResetCheck(true);
    }

    if (timeWarp > 0) { timeUpdate(timeWarp, tick); }
};

export const assignBuildingsProduction = {
    /** Everything that can affect all Stages */
    multipliersAll: () => {
        global.dischargeInfo.total = calculateEffects.effectiveGoals();
        global.dischargeInfo.base = calculateEffects.goalsBase();
        global.vaporizationInfo.tension = player.upgrades[2][3] === 1 ? new Overlimit(player.buildings[2][0].current).max('1').power(calculateEffects.S2Upgrade3()).toNumber() : 1;
        global.vaporizationInfo.stress = player.upgrades[2][4] === 1 ? new Overlimit(player.buildings[2][1].current).max('1').power(calculateEffects.S2Upgrade4()).toNumber() : 1;
        global.accretionInfo.effective = calculateEffects.effectiveRank();
    },
    /** Everything that affects only Microworld Structures */
    multipliersStage1: () => {
        global.dischargeInfo.selfBoost = calculateEffects.S1Upgrade7();
        let multiplier = (player.inflation.vacuum ? 2 : 1.8) ** player.strangeness[1][0];
        if (player.upgrades[1][5] === 1) { multiplier *= global.dischargeInfo.base ** global.dischargeInfo.total; }
        if (player.strangeness[1][6] >= 1) { multiplier *= global.strangeInfo.stageBoost[1]; }
        if ((player.inflation.tree[4] >= 1 || player.challenges.active === 0) && player.inflation.vacuum) { multiplier *= global.milestonesInfo[1].reward[0]; }
        if (player.challenges.active === 0) { multiplier /= 4; }
        global.dischargeInfo.miltiplier = multiplier;
    },
    /** Preons, true vacuum only */
    S1Build1: (noHardcap = false): Overlimit => {
        const production = global.buildingsInfo.producing[1][1];
        const structure = player.buildings[1][1];

        const multiplierList = [];
        const preonsExcess = new Overlimit(structure.current).minus(structure.true);
        if (preonsExcess.moreThan('1')) {
            multiplierList.push(preonsExcess.power(0.11).plus(structure.true));
        } else { multiplierList.push(structure.current); }
        if (player.upgrades[1][7] === 1) {
            if (structure.true < 1001) {
                const selfPreons = calculateEffects.S1Upgrade7(true); //Formula is '(selfPreons * step ** ((true - 1) / 2)) ** true'; Step is '(selfBoost / selfPreons) ** (1 / 500)'
                multiplierList.push(((global.dischargeInfo.selfBoost / selfPreons) ** ((structure.true - 1) / 1000) * selfPreons) ** structure.true);
            } else { multiplierList.push(global.dischargeInfo.selfBoost ** 1001); }
        }
        const laterPreons = calculateEffects.effectiveEnergy() ** calculateEffects.S1Extra3();
        production.setValue(6e-4 * global.dischargeInfo.miltiplier * laterPreons).multiply(...multiplierList);
        if (!noHardcap) {
            assignPreonsHardcap(laterPreons);
            if (production.moreThan(global.inflationInfo.preonCap)) { production.setValue(global.inflationInfo.preonCap); }
        }
        return production;
    },
    /** Quarks, true vacuum only */
    S1Build2: (): Overlimit => {
        const multiplierList = [player.buildings[1][2].current];
        if (player.upgrades[1][7] === 1) { multiplierList.push(new Overlimit(global.dischargeInfo.selfBoost).power(player.buildings[1][2].true)); }
        return global.buildingsInfo.producing[1][2].setValue(0.4 * global.dischargeInfo.miltiplier).multiply(...multiplierList);
    },
    /** Particles */
    S1Build3: (): Overlimit => {
        const index = player.inflation.vacuum ? 3 : 1;

        const multiplierList = [player.buildings[1][index].current];
        let multiplier = (player.inflation.vacuum ? 0.2 : 1.6) * global.dischargeInfo.miltiplier;
        if (player.upgrades[1][0] === 1) { multiplier *= 8; }
        if (player.upgrades[1][7] === 1) { multiplierList.push(new Overlimit(global.dischargeInfo.selfBoost).power(player.buildings[1][index].true)); }
        return global.buildingsInfo.producing[1][index].setValue(multiplier).multiply(...multiplierList);
    },
    /** Atoms */
    S1Build4: (): Overlimit => {
        const vacuum = player.inflation.vacuum;
        const index = vacuum ? 4 : 2;

        const multiplierList = [player.buildings[1][index].current];
        let multiplier = (vacuum ? 0.8 : 0.4) * global.dischargeInfo.miltiplier;
        if (player.upgrades[1][3] === 1) { multiplier *= vacuum ? 6 : 4; }
        if (player.upgrades[1][7] === 1) { multiplierList.push(new Overlimit(global.dischargeInfo.selfBoost).power(player.buildings[1][index].true)); }
        return global.buildingsInfo.producing[1][index].setValue(multiplier).multiply(...multiplierList);
    },
    /** Molecules */
    S1Build5: (): Overlimit => {
        const b5 = player.inflation.vacuum ? 5 : 3;

        const multiplierList = [player.buildings[1][b5].current];
        let multiplier = 0.2 * global.dischargeInfo.miltiplier;
        if (player.upgrades[1][4] === 1) { multiplier *= 4; }
        if (player.upgrades[1][7] === 1) { multiplierList.push(new Overlimit(global.dischargeInfo.selfBoost).power(player.buildings[1][b5].true)); }
        return global.buildingsInfo.producing[1][b5].setValue(multiplier).multiply(...multiplierList);
    },
    S1Build6: (): Overlimit => {
        let multiplier = (calculateEffects.S1Research2() ** player.researches[1][2]) * (calculateEffects.S1Research5() ** player.researches[1][5]);
        if (player.upgrades[1][9] === 1) { multiplier *= calculateEffects.effectiveEnergy() ** 0.5; }
        global.dischargeInfo.tritium.setValue(assignBuildingsProduction.S1Build5()).plus('1').log(calculateEffects.S1Extra1()).multiply(multiplier);
        if (player.inflation.vacuum) { global.dischargeInfo.tritium.multiply(assignBuildingsProduction.S2Build1()); }
        return global.dischargeInfo.tritium;
    },
    /** Drops */
    S2Build1: (): Overlimit => {
        const vacuum = player.inflation.vacuum;
        const structure = player.buildings[2][1];

        const multiplierList = [structure.current];
        if (player.challenges.active === 0) {
            multiplierList[0] = new Overlimit(structure.current).min(1);
        } else if (vacuum) {
            const excess = new Overlimit(structure.current).minus(structure.true);
            if (excess.moreThan('1')) { multiplierList[0] = excess.power(0.2).plus(structure.true); }
        }
        if (player.upgrades[2][0] === 1) { multiplierList.push(new Overlimit(vacuum ? '1.02' : '1.04').power(structure.true)); }
        global.buildingsInfo.producing[2][1].setValue((vacuum ? 2 : 8e-4) * (3 ** global.vaporizationInfo.trueResearch0) * (2 ** player.strangeness[2][0])).multiply(...multiplierList);
        if (vacuum) { return global.buildingsInfo.producing[2][1].max('1'); }
        return global.buildingsInfo.producing[2][1];
    },
    /** Puddles */
    S2Build2: (): Overlimit => {
        const productions = global.buildingsInfo.producing[2];
        const structures = player.buildings[2];
        const info = global.vaporizationInfo;
        const rain = calculateEffects.S2Extra1(info.trueResearchRain);
        const flow = 1.24 ** player.strangeness[2][7];

        if (structures[6].true >= 1) {
            productions[6].setValue(player.upgrades[2][8] === 1 ? '1.1' : '1.08').power(structures[6].true).multiply(flow);
        } else { productions[6].setValue('1'); }

        productions[5].setValue(2 * calculateEffects.S2Extra2(rain) * flow).multiply(structures[5].current, productions[6]).max('1');

        productions[4].setValue(2 * flow).multiply(structures[4].current, productions[5]).max('1');

        productions[3].setValue(2 * flow).multiply(structures[3].current, productions[4]).max('1');

        if (structures[2].current.lessThan('1')) { return productions[2].setValue(calculateEffects.S2Extra1(player.researchesExtra[2][1]) - 1); }
        const multiplierList = [structures[2].current, productions[3], calculateEffects.clouds()];
        let multiplier = (player.challenges.active === 0 ? 6e-4 : 4.8) * (2 ** info.trueResearch1) * info.tension * info.stress * rain * ((player.inflation.vacuum ? 1.8 : 1.6) ** player.strangeness[2][1]);
        if (player.upgrades[2][1] === 1) { multiplierList.push(calculateEffects.S2Upgrade1()); }
        if (player.inflation.vacuum) {
            multiplier *= calculateEffects.S3Extra4();
            if (player.elements[1] >= 1) { multiplier *= 2; }
            if (player.inflation.tree[4] >= 1 || player.challenges.active === 0) { multiplier *= global.milestonesInfo[2].reward[1]; }
        }
        if (player.strangeness[2][6] >= 1) { multiplier *= global.strangeInfo.stageBoost[2]; }
        return productions[2].setValue(multiplier).multiply(...multiplierList);
    },
    /** Everything that affects only Accretion Structures */
    multipliersStage3: () => {
        const productions = global.buildingsInfo.producing[3];

        global.accretionInfo.multiplier = (player.inflation.vacuum ? 1.48 : 1.6) ** player.strangeness[3][1];
        productions[5].setValue('1.1').power(player.buildings[3][5].true);

        productions[4].setValue(player.upgrades[3][12] === 1 ? '1.14' : '1.1').power(player.buildings[3][4].true).multiply(productions[5]);
        global.accretionInfo.satellites.setValue(productions[4]).power(player.inflation.vacuum ? 0.1 : 0.2);
    },
    /** Cosmic dust and related softcap */
    S3Build1: (noHardcap = false): Overlimit => {
        const production = global.buildingsInfo.producing[3][1];
        const info = global.accretionInfo;
        const researchesS3 = player.researches[3];
        const upgradesS3 = player.upgrades[3];
        const vacuum = player.inflation.vacuum;

        const multiplierList = [player.buildings[3][1].current];
        let multiplier = (vacuum ? 2 : 8e-20) * (3 ** researchesS3[0]) * (2 ** researchesS3[3]) * (3 ** researchesS3[5]) * (1.11 ** player.researchesExtra[3][0]) * (calculateEffects.S3Extra1() ** global.accretionInfo.effective) * (1.8 ** player.strangeness[3][0]);
        if (vacuum) {
            multiplier *= calculateEffects.submersion();
            if (player.elements[4] >= 1) { multiplier *= 1.4; }
            if (player.elements[14] >= 1) { multiplier *= 1.4; }
            if (player.inflation.tree[4] >= 1 || player.challenges.active === 0) { multiplier *= global.milestonesInfo[3].reward[0]; }
        }
        if (upgradesS3[0] === 1) { multiplierList.push(new Overlimit(calculateEffects.S3Upgrade0()).power(player.buildings[3][1].true)); }
        if (upgradesS3[1] === 1) { multiplier *= calculateEffects.S3Upgrade1(); }
        if (upgradesS3[2] === 1) { multiplier *= 2; }
        if (upgradesS3[5] === 1) { multiplier *= 3; }
        if (upgradesS3[6] === 1) { multiplier *= 2 * 1.5 ** researchesS3[7]; }
        if (upgradesS3[9] === 1) { multiplier *= 2; }
        if (upgradesS3[10] === 1) { multiplier *= 8 * 2 ** researchesS3[8]; }
        if (player.strangeness[3][3] >= 1) { multiplierList.push(info.satellites); }
        production.setValue(multiplier).multiply(...multiplierList);
        if (player.challenges.active === 0) {
            info.dustSoft = player.accretion.rank >= 5 ? 0.8 : 0.9;
        } else if (player.accretion.rank >= 5) {
            info.dustSoft = vacuum || production.moreThan('1') ? 0.9 : 1.1;
        } else { info.dustSoft = 1; }
        production.power(info.dustSoft);
        if (vacuum && !noHardcap) {
            //assignDustHardcap();
            if (production.moreThan(global.inflationInfo.dustCap)) {
                production.setValue(global.inflationInfo.dustCap);
            } else { production.max('1'); }
        }
        return production;
    },
    /** Planetesimals */
    S3Build2: (): Overlimit => {
        const multiplierList = [player.buildings[3][2].current];
        let multiplier = (3 ** player.researches[3][2]) * global.accretionInfo.multiplier;
        if (player.upgrades[3][3] === 1) { multiplierList.push(new Overlimit(calculateEffects.S3Upgrade3()).power(player.buildings[3][2].true)); }
        if (player.upgrades[3][4] === 1) { multiplier *= 3; }
        if (player.researches[3][6] >= 1) { multiplier *= calculateEffects.S3Research6(); }
        if (player.strangeness[3][3] >= 1) { multiplierList.push(global.accretionInfo.satellites); }
        return global.buildingsInfo.producing[3][2].setValue(multiplier).multiply(...multiplierList);
    },
    /** Protoplanets */
    S3Build3: (): Overlimit => {
        const multiplierList = [player.buildings[3][3].current, global.buildingsInfo.producing[3][4]];
        let multiplier = 0.4 * global.accretionInfo.multiplier;
        if (player.researchesExtra[3][2] >= 1) { multiplier *= 2; }
        if (player.upgrades[3][7] === 1) { multiplierList.push(new Overlimit('1.02').power(player.buildings[3][3].true)); }
        return global.buildingsInfo.producing[3][3].setValue(multiplier).multiply(...multiplierList);
    },
    /** Everything that affects only Interstellar Structures */
    multipliersStage4: () => {
        const info = global.collapseInfo;
        info.massEffect = calculateEffects.mass();
        info.neutronEffect = calculateEffects.star[1]();

        let multiplier = calculateEffects.S4Research0(calculateEffects.S4Research0_base()) * info.massEffect * info.neutronEffect * calculateEffects.S4Research4() * (1.6 ** player.strangeness[4][0]);
        if (player.elements[4] >= 1) { multiplier *= 1.4; }
        if (player.elements[14] >= 1) { multiplier *= 1.4; }
        if (player.inflation.vacuum) {
            if (player.researchesExtra[2][3] >= 1) { multiplier *= global.vaporizationInfo.tension; }
            if (player.researchesExtra[2][3] >= 3) {
                multiplier *= global.vaporizationInfo.stress;
            } else if (player.researchesExtra[2][3] === 2) { multiplier *= global.vaporizationInfo.stress ** 0.5; }
            if (player.inflation.tree[4] >= 1 || player.challenges.active === 0) { multiplier *= global.milestonesInfo[4].reward[0]; }
        }
        if (player.strangeness[4][7] >= 1) { multiplier *= global.strangeInfo.stageBoost[4]; }
        if (player.challenges.active === 0) { multiplier /= 8000; }
        global.collapseInfo.multiplier = multiplier;

        let clustersNumber = 2 * (2 ** player.researches[5][1]);
        if (player.upgrades[5][1] === 1) { clustersNumber *= calculateEffects.S5Upgrade1(); }
        global.buildingsInfo.producing[5][2].setValue(clustersNumber).multiply(player.buildings[5][2].current, global.mergeInfo.multiplier).max(2 ** player.researches[5][1]);
    },
    /** This one can change because of Stars, doesn't assigns anything */
    multipliersStage4Extra: (): Overlimit => {
        const multiplier = new Overlimit(calculateEffects.S4Research1()).power(global.collapseInfo.trueStars);
        if (player.elements[24] >= 1) { multiplier.multiply(new Overlimit(player.buildings[4][0].current).max('1').power(calculateEffects.element24())); }
        if (player.inflation.vacuum) {
            if (player.researchesExtra[1][4] >= 1) { multiplier.multiply(calculateEffects.S1Extra4() ** global.dischargeInfo.total); }
        }
        return multiplier;
    },
    /** Brown dwarfs */
    S4Build1: (): Overlimit => {
        const multiplierList = [player.buildings[4][1].current, assignBuildingsProduction.multipliersStage4Extra()];
        let multiplier = 40 * global.collapseInfo.multiplier;
        if (player.elements[1] >= 1) { multiplier *= 2; }
        if (player.elements[19] >= 1 && global.collapseInfo.massEffect > 1) { multiplier *= global.collapseInfo.massEffect; }
        const level = player.inflation.vacuum ? 4 : 3;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][1].setValue(multiplier).multiply(...multiplierList);
    },
    /** Main sequence */
    S4Build2: (): Overlimit => {
        const multiplierList = [player.buildings[4][2].current, assignBuildingsProduction.multipliersStage4Extra()];
        let multiplier = 1200 * global.collapseInfo.multiplier * calculateEffects.star[0]() * (2 ** player.researches[4][3]);
        const level = player.inflation.vacuum ? 3 : 2;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][2].setValue(multiplier).multiply(...multiplierList);
    },
    /** Red supergiants */
    S4Build3: (): Overlimit => {
        const multiplierList = [player.buildings[4][3].current, assignBuildingsProduction.multipliersStage4Extra()];
        let multiplier = 6e7 * global.collapseInfo.multiplier;
        const level = player.inflation.vacuum ? 2 : 1;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][3].setValue(multiplier).multiply(...multiplierList);
    },
    /** Blue hypergiants */
    S4Build4: (): Overlimit => {
        const multiplierList = [player.buildings[4][4].current, assignBuildingsProduction.multipliersStage4Extra()];
        let multiplier = 6e9 * global.collapseInfo.multiplier;
        const level = player.inflation.vacuum ? 1 : 0;
        if (player.researches[5][1] >= level) {
            multiplierList.push(global.buildingsInfo.producing[5][2]);
            multiplier /= 2 ** level;
        }
        return global.buildingsInfo.producing[4][4].setValue(multiplier).multiply(...multiplierList);
    },
    /** Quasi-stars */
    S4Build5: (): Overlimit => {
        if (player.challenges.active === 0) { return global.buildingsInfo.producing[4][5].setValue('0'); }
        return global.buildingsInfo.producing[4][5].setValue(2e11 * global.collapseInfo.multiplier).multiply(player.buildings[4][5].current, assignBuildingsProduction.multipliersStage4Extra(), global.buildingsInfo.producing[5][2]);
    },
    /** Everything that affects only Intergalactic Structures */
    multipliersStage5: () => {
        const vacuum = player.inflation.vacuum;
        const milestones = vacuum && (player.inflation.tree[4] >= 1 || player.challenges.active === 0);
        const galaxies = player.buildings[5][3];
        const production = global.buildingsInfo.producing[5][3];

        let base = (vacuum ? 2 : 6) + calculateEffects.S5Upgrade2();
        if (milestones) { base += global.milestonesInfo[5].reward[1]; }
        production.setValue(base).power(galaxies.true);
        const current = galaxies.current.toNumber();
        if (current > 0) { production.multiply(((current + 1) / (galaxies.true + 1)) * calculateEffects.reward[0]()); }
        global.mergeInfo.galaxyBase = base;

        let multiplier = (vacuum ? 1.4 : 1.6) ** player.strangeness[5][0];
        if (milestones) { multiplier *= global.milestonesInfo[5].reward[0]; }
        global.mergeInfo.multiplier.setValue(multiplier).multiply(production);
    },
    /** Nebulas */
    S5Build1: (): Overlimit => {
        let multiplier = 6 * (2 ** player.researches[5][0]);
        if (player.upgrades[5][0] === 1) { multiplier *= calculateEffects.S5Upgrade0(); }
        return global.buildingsInfo.producing[5][1].setValue(multiplier).multiply(player.buildings[5][1].current, global.mergeInfo.multiplier);
    },
    /** Universes */
    S6Build1: (): Overlimit => global.buildingsInfo.producing[6][1].setValue(player.buildings[6][1].current).power(player.buildings[6][1].true / 4 + 1)
};

const assignSharedHardcapDelays = () => {
    global.inflationInfo.accretion = calculateMassGain();
    let effect = calculateEffects.star[2]();
    if (player.elements[10] >= 1) { effect *= 2; }
    if (player.researchesExtra[4][1] >= 1) { effect *= calculateEffects.S4Extra1(); }
    global.inflationInfo.microworld = effect;
};
const assignPreonsHardcap = (laterPreons: number) => {
    global.inflationInfo.preonCap.setValue(1e14 * laterPreons * global.inflationInfo.microworld).multiply(assignBuildingsProduction.S3Build1());
};
const assignDustHardcap = () => {
    global.inflationInfo.dustCap.setValue((player.accretion.rank >= 5 ? 1e48 : 8e46) * global.inflationInfo.accretion * (1.4 ** player.strangeness[3][8]));
};
const assignSolarMassHardcap = () => {
    const info = global.inflationInfo;
    info.massCap = 0.01235 * info.accretion * info.microworld;
    if (player.strangeness[5][7] >= 1) { info.massCap *= global.strangeInfo.stageBoost[5]; }
};
export const assignSubmergedLevels = (reset = false) => {
    const info = global.vaporizationInfo;
    if (reset) {
        info.trueResearchRain = 0;
        info.trueResearch1 = 0;
        info.trueResearch0 = 0;
        return;
    }
    const totalDrops = player.buildings[2][1].total.toNumber();
    if (info.trueResearchRain !== player.researchesExtra[2][1]) { info.trueResearchRain = player.researchesExtra[2][2] >= 1 ? player.researchesExtra[2][1] : Math.min(player.researchesExtra[2][1], logAny(totalDrops * 999 / 1e12 + 1, 1e3)); }
    if (info.trueResearch1 !== player.researches[2][1]) { info.trueResearch1 = Math.min(player.researches[2][1], logAny(totalDrops / 100 + 1, 5)); }
    if (info.trueResearch0 !== player.researches[2][0]) { info.trueResearch0 = Math.min(player.researches[2][0], Math.max(logAny(totalDrops / 10, 1.366) + 1, logAny(totalDrops * 0.366 / 10 + 1, 1.366))); }
};

export const calculateEffects = {
    effectiveEnergy: (): number => {
        let energy = player.discharge.energy;
        if (player.inflation.vacuum && (player.inflation.tree[4] >= 1 || player.challenges.active === 0)) { energy *= global.milestonesInfo[1].reward[1]; }
        return Math.max(energy, 1);
    },
    effectiveGoals: (): number => player.discharge.current + (player.strangeness[1][3] / 2),
    /** Research is player.researches[1][4] */
    goalsBase: (research = player.researches[1][4]): number => {
        let base = (4 + research) / 2;
        if (player.challenges.active === 0) { base **= 0.5; }
        return base;
    },
    /** Result need to be divided by 10 */
    S1Upgrade6: (): number => 10 + 3 * player.researches[1][0],
    /** Preons default value is false */
    S1Upgrade7: (preons = false): number => {
        let base = 2 + player.researches[1][1];
        if (preons) { base *= 1.6; }
        return (base + 100) / 100;
    },
    S1Research2: (level = player.strangeness[1][1]): number => 20 + (level * (player.inflation.vacuum ? 1.5 : 1)),
    S1Research5: (): number => {
        const discharges = global.dischargeInfo.total;
        if (!player.inflation.vacuum) { return discharges > 5 ? discharges + 15 : discharges * 4; }
        return discharges > 7 ? discharges + 14 : discharges * 3;
    },
    S1Extra1: (level = player.researchesExtra[1][1]): number => level >= 4 ? 1.1 : level >= 3 ? 1.2 : (20 - 3 * level) / 10,
    S1Extra3: (level = player.researchesExtra[1][3]): number => level / 20,
    S1Extra4: (): number => (global.dischargeInfo.base + calculateEffects.effectiveEnergy() ** 0.1) / 100 + 1,
    /* Submerged Stage */
    clouds: (post = false): Overlimit => {
        const effect = new Overlimit(player.vaporization.clouds).plus('1');
        if (post) { effect.plus(global.vaporizationInfo.get); }

        if (effect.moreThan('1e4')) { effect.minus('1e4').power(0.7).plus('1e4'); }
        return effect;
    },
    S2Upgrade1: (): Overlimit => {
        const puddles = player.buildings[2][2];
        const maxTrue = Math.min(puddles.true, 200);
        return new Overlimit('1.02').power((puddles.current.toNumber() - maxTrue) ** 0.7 + maxTrue);
    },
    S2Upgrade2: (): number => {
        let effect = 1e10 / (player.inflation.vacuum ? 2.5 : 2) ** player.strangeness[2][3];
        if (player.inflation.vacuum && (player.inflation.tree[4] >= 1 || player.challenges.active === 0)) { effect *= global.milestonesInfo[2].reward[0]; }
        return effect;
    },
    /** Research is player.researches[2][2] */
    S2Upgrade3: (research = player.researches[2][2]): number => (1 + research / 2) / 100,
    /** Research is player.researches[2][3] */
    S2Upgrade4: (research = player.researches[2][3]): number => (1 + research / 2) / 100,
    S2Upgrade5: (): number => 1 + player.researches[2][4],
    S2Upgrade6: (): number => 1 + player.researches[2][5],
    /** Level is global.vaporizationInfo.trueResearchRain if used for production and player.researchesExtra[2][1] if for automatization */
    S2Extra1: (level: number, post = false): number => { //+^0.05 per level; Drops up to +^(0.05 / 3) after softcap
        if (level <= 0) { return 1; }
        const effect = new Overlimit(player.vaporization.clouds);
        if (post) { effect.plus(global.vaporizationInfo.get); }
        return Math.max(new Overlimit(effect).power(level / 60).multiply(effect.min('1e6').power(level / 30)).toNumber(), 1);
    },
    /** Rain is calculateEffects.S2Extra1() */
    S2Extra2: (rain: number, level = player.researchesExtra[2][2]): number => level >= 1 ? (rain - 1) / 32 + 1 : 1,
    submersion: (): number => {
        const drops = new Overlimit(player.buildings[2][1].current).plus('1');
        return new Overlimit(drops).power(0.6).divide(drops.min('1e10').power(0.4)).plus('1').log(2).toNumber(); //^0.2 before softcap, ^0.6 after
    },
    /* Accretion Stage */
    effectiveRank: (): number => {
        let rank = player.accretion.rank;
        if (player.inflation.vacuum && (player.inflation.tree[4] >= 1 || player.challenges.active === 0)) { rank += global.milestonesInfo[3].reward[1]; }
        return rank;
    },
    S3Upgrade0: (): number => (101 + player.researches[3][1]) / 100,
    /** Research is player.researchesExtra[3][3] */
    S3Upgrade1: (research = player.researchesExtra[3][3]): number => {
        const power = (11 + research) / 100; //2 times stronger for self-made dust
        return Math.max(new Overlimit(player.buildings[3][1].current).power(power).multiply((player.buildings[3][1].true + 1) ** power).toNumber(), 1);
    },
    S3Upgrade3: (): number => (204 + player.researches[3][4]) / 200, //1.02 + 0.005
    S3Research6: (level = player.researches[3][6]): number => { //+^0.025 per level; Drops up to +^(0.025 / 3) after softcap
        const mass = new Overlimit(player.buildings[3][0].current).max('1');
        return new Overlimit(mass).power(level / 120).multiply(mass.min('1e21').power(level / 60)).toNumber();
    },
    S3Extra1: (level = player.researchesExtra[3][1]): number => (100 + 11 * level) / 100,
    S3Extra4: (level = player.researchesExtra[3][4]): number => level > 0 ? 8 ** ((global.accretionInfo.effective + level) / 8) : 1,
    /* Interstellar Stage */
    mass: (post = false): number => {
        let effect = player.collapse.mass;
        if (post) {
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        if (effect > 1) {
            if (player.elements[21] >= 1) { effect **= 1.1; }
            if (player.challenges.active === 0) { effect **= 0.2; }
        }
        return effect;
    },
    star: [
        (post = false): number => {
            let effect = player.collapse.stars[0] + 1;
            if (post) {
                effect += global.collapseInfo.starCheck[0];
            }
            if (player.elements[27] >= 1) { effect += player.buildings[4][3].true; }

            if (player.elements[6] >= 1) { effect **= calculateEffects.element6(); }
            return effect;
        },
        (post = false): number => {
            let stars = player.collapse.stars[1] * (1 + player.strangeness[4][8]);
            if (post) {
                stars += global.collapseInfo.starCheck[1] * (1 + player.strangeness[4][8]);
                if (player.elements[22] >= 1) { stars += global.collapseInfo.starCheck[0]; }
            }
            if (player.elements[22] >= 1) { stars += player.collapse.stars[0]; }

            let effect = (stars + 1) ** (0.5 + player.strangeness[4][8] / 8);
            if (player.elements[12] >= 1) { effect *= logAny(stars + 4, 4); }
            return effect;
        },
        (post = false): number => {
            let blackHoles = player.collapse.stars[2];
            if (post) {
                blackHoles += global.collapseInfo.starCheck[2];
            }

            const base = player.elements[18] >= 1 ? 3 : 2;
            let effect = (blackHoles + 1) / logAny(blackHoles + base, base);
            if (blackHoles > 0 && player.inflation.vacuum && (player.inflation.tree[4] >= 1 || player.challenges.active === 0)) { effect *= global.milestonesInfo[4].reward[1]; }
            return effect;
        }
    ],
    /** Disc is player.researches[4][2] */
    S4Research0_base: (disc = player.researches[4][2]): number => (14 + disc) / 10,
    /** Base is calculateEffects.S4Research0_base() */
    S4Research0: (base: number): number => {
        let levels = player.researches[4][0];
        if (player.elements[19] >= 1) { levels++; }
        return base ** levels;
    },
    /** Transfer is player.researchesExtra[4][1] */
    S4Research1: (level = player.researches[4][1], transfer = player.researchesExtra[4][1]): number => {
        let effective = level > 0 ? 1 + Math.min(level, 4) : 0;
        if (level > 4) { effective += 0.5; }
        if (level > 5) { effective += Math.min(level - 5, 2) / 4; }
        if (level > 7) { effective += (level - 7) / 8; }
        return 1 + (transfer >= 1 ? 0.006 : 0.005) * effective;
    },
    S4Research4: (post = false, level = player.researches[4][4]): number => {
        if (level < 1) { return 1; }

        let blackHoles = player.collapse.stars[2];
        let mass = player.collapse.mass;
        if (post) {
            blackHoles += global.collapseInfo.starCheck[2];
            if (global.collapseInfo.newMass > mass) { mass = global.collapseInfo.newMass; }
        }

        const base = level >= 2 ? 2 : 3;
        let effect = logAny(blackHoles + base, base);
        if (player.elements[23] >= 1 && mass > 1) { effect *= mass ** 0.1; }
        return effect;
    },
    S4Extra1: (): number => (10 + player.researches[4][1]) / 10,
    /* Intergalactic Stage */
    reward: [
        (post = false): number => {
            let effect = player.merge.reward[0] + 1;
            if (post) { effect += global.mergeInfo.checkReward[0]; }
            return effect;
        },
        (): number => 1
    ],
    S5Upgrade0: (): number => 3 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade1: (): number => 2 * ((player.inflation.vacuum ? 1.6 : 1.8) ** player.strangeness[5][1]),
    S5Upgrade2: (post = false, level = player.upgrades[5][2]): number => {
        if (level < 1) { return 0; }
        let effect = player.collapse.mass;
        if (post) {
            if (global.collapseInfo.newMass > effect) { effect = global.collapseInfo.newMass; }
        }

        effect = Math.log10(Math.max(effect / 1e5, 1)) / 4 + 0.25;
        if (!player.inflation.vacuum) { effect *= 2; }
        return Math.min(effect, 1);
    },
    /* Rest */
    element6: (): number => player.researchesExtra[4][2] >= 1 ? 2 : 1.5,
    element24: (): number => player.elements[27] >= 1 ? 0.02 : 0.01,
    element26: (): number => {
        if (player.stage.true < 6 && player.strange[0].total < 1) { return 0; }
        let effect = new Overlimit(player.buildings[4][0].trueTotal).log(10).toNumber() - 48;
        if (player.elements[29] >= 1) { effect = (199 + effect) * effect / 200; }
        return Math.max(effect, 0);
    },
    S2Strange9: (): number => new Overlimit(player.vaporization.clouds).plus('1').log(10).toNumber() / 80 + 1,
    inflation0: (): number => Math.max(2 ** (1 - player.time.stage / 1800), 1),
    inflation1: (level = player.inflation.tree[1]): number => new Overlimit(player.buildings[6][0].current).plus('1').power(level / 32).toNumber(),
    /** Default value for type is 0 or Quarks; Use 1 for Strangelets */
    strangeGain: (interstellar: boolean, type = 0 as 0 | 1): number => {
        let base = type === 1 ? 0 : player.inflation.vacuum ?
            (player.strangeness[5][3] >= 1 ? 5 : 4) :
            (player.milestones[1][0] >= 6 ? 2 : 1);
        if (interstellar) {
            base = (base + calculateEffects.element26()) * (player.buildings[5][3].current.toNumber() + 1);
            if (player.inflation.vacuum && player.strangeness[2][9] >= 1) { base *= calculateEffects.S2Strange9(); }
        } else if (type === 1) { return 0; }
        if (type === 0) {
            base *= (1.4 ** player.strangeness[5][2]) * (1.4 ** player.inflation.tree[2]);
        }
        return base * global.strangeInfo.strangeletsInfo[1];
    }
};

export const buyBuilding = (index: number, stageIndex: number, howMany = player.toggles.shop.input, auto = false) => {
    if (!checkBuilding(index, stageIndex) || (!auto && global.paused)) { return; }
    const building = player.buildings[stageIndex][index as 1];

    let currency; //Readonly
    let free = false;
    let multi = true;
    let special = '' as '' | 'Mass' | 'Galaxy' | 'Universe';
    if (stageIndex === 1) {
        currency = player.buildings[1][index - 1].current;
        if (index === 1 && player.inflation.vacuum) {
            free = player.strangeness[1][8] >= 1 && (player.researchesExtra[1][2] >= 1 ||
                (player.challenges.superVoid[1] >= 2 && (player.inflation.tree[3] >= 1 || player.challenges.active === 0)));
        }
    } else if (stageIndex === 2) {
        currency = player.buildings[2][index === 1 ? 0 : 1].current;
    } else if (stageIndex === 3) {
        if (player.inflation.vacuum) { special = 'Mass'; }
        currency = player.buildings[3][0].current;
    } else if (stageIndex === 6) {
        currency = player.merge.reward[0];
        special = 'Universe';
        multi = false;
    } else {
        if (stageIndex === 5 && index === 3) {
            special = 'Galaxy';
            currency = player.collapse.mass;
            multi = false;
        } else { currency = player.buildings[4][0].current; }
    }

    const budget = new Overlimit(currency);
    if (auto && building.true >= 1 && !free && multi) {
        if (special === 'Mass' && global.accretionInfo.disableAuto) {
            if (player.accretion.rank >= 6) {
                budget.minus(global.inflationInfo.massCap * 1.98847e33);
            } else if (player.strangeness[3][4] < 2 && player.challenges.superVoid[1] >= 2 && (player.inflation.tree[3] >= 1 || player.challenges.active === 0)) {
                budget.minus(global.accretionInfo.rankCost[player.accretion.rank]);
            } else {
                budget.divide(player.toggles.shop.wait[stageIndex]);
            }
        } else {
            budget.divide(player.stage.true >= 3 ? player.toggles.shop.wait[stageIndex] : '2');
        }
    }

    const total = calculateBuildingsCost(index, stageIndex);
    if (total.moreThan(budget)) { return; }

    let afford = 1;
    if (howMany !== 1 && multi) {
        const scaling = global.buildingsInfo.increase[stageIndex][index]; //Must be >1
        if (free) {
            afford = Math.floor(budget.divide(total).log(scaling).toNumber()) + 1;

            if (howMany > 0) {
                if (afford < howMany) { return; }
                afford = howMany;
            }
        } else {
            afford = Math.floor(budget.multiply(scaling - 1).divide(total).plus('1').log(scaling).toNumber());

            if (howMany > 0) {
                if (afford < howMany) { return; }
                afford = howMany;
            }
            if (afford > 1) { total.multiply(new Overlimit(scaling).power(afford).minus('1').divide(scaling - 1)); }
        }
    }

    building.true += afford;
    building.current.plus(afford);
    building.total.plus(afford);
    building.trueTotal.plus(afford);

    if (typeof currency === 'object') {
        if (!free) {
            currency.minus(total);
            if (special === 'Mass') {
                player.buildings[1][0].current.setValue(currency).divide('1.78266192e-33');
            } else if (player.inflation.vacuum && index === 1) {
                if (stageIndex === 1) {
                    player.buildings[3][0].current.setValue(currency).multiply('1.78266192e-33');
                } else if (stageIndex === 2) {
                    player.buildings[1][5].current.setValue(currency).multiply('6.02214076e23');
                }
            }
        }

        if (player.inflation.vacuum || stageIndex === 1) { addEnergy(afford, index, stageIndex); }
        if (stageIndex === 1) { //True vacuum only
            if (index === 5 && player.upgrades[1][8] === 0) { player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23'); }
        } else if (stageIndex === 2) {
            if (index === 1) {
                if (player.buildings[2][2].current.lessThan('1')) { assignSubmergedLevels(); }
            } else { assignPuddles(); }
        } else if (stageIndex === 3) {
            if (index >= 4) {
                assignBuildingsProduction.multipliersStage3();
                awardMilestone(1, 3);
            }
        } else if (stageIndex === 4) {
            global.collapseInfo.trueStars += afford;
        }

        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Made ${format(afford)} '${global.buildingsInfo.name[stageIndex][index]}'`; }
        }
    } else if (special === 'Galaxy') {
        reset('galaxy', player.inflation.vacuum ? [1, 2, 3, 4, 5] : [4, 5]);
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
        calculateMaxLevel(2, 4, 'researches');
        awardVoidReward(5);
        awardMilestone(1, 5);
        if (!auto) {
            numbersUpdate();
            if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Galaxy reset to gain ${format(afford)} new 'Galaxies'`; }
        }
    } else if (special === 'Universe') {
        if (player.stage.true < 7) { player.stage.true = 7; }
        if ((player.toggles.normal[0] && global.tab !== 'inflation') || player.stage.active < 6) { setActiveStage(1); }
        const realTime = player.time.universe;
        const income = building.true;
        player.cosmon.current += income;
        player.cosmon.total += income;
        player.inflation.vacuum = false;
        player.inflation.age = 0;
        player.time.universe = 0;
        player.inflation.resets++;
        const info = global.milestonesInfoS6;
        const start = info.active.indexOf(false);
        if (start >= 0) {
            for (let i = start; i < info.requirement.length; i++) {
                info.active[i] = building.current.moreOrEqual(info.requirement[i]);
            }
        }
        player.clone = {};
        player.challenges.active = null;
        prepareVacuum(false);
        visualUpdateInflation();
        visualTrueStageUnlocks();
        resetVacuum();

        const history = player.history.vacuum;
        const storage = global.historyStorage.vacuum;
        storage.unshift([realTime, true, income]);
        if (storage.length > 100) { storage.length = 100; }
        if (income / realTime > history.best[2] / history.best[0]) {
            history.best = [realTime, true, income];
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Universe reset to gain ${format(afford)} new 'Universes'`; }
    }
};

/** Increase is how many new Structures have been gained */
export const addEnergy = (increase: number, index: number, stage: number) => {
    const { discharge } = player;
    const { dischargeInfo } = global;

    const add = dischargeInfo.energyType[stage][index] * increase;
    dischargeInfo.energyStage[stage] += add;
    dischargeInfo.energyTrue += add;
    discharge.energy += add;
    if (discharge.energyMax < discharge.energy) { discharge.energyMax = discharge.energy; }
};

export const calculateBuildingsCost = (index: number, stageIndex: number): Overlimit => {
    const scaling = global.buildingsInfo.increase[stageIndex];
    let firstCost = global.buildingsInfo.startCost[stageIndex][index];
    if (stageIndex === 1) {
        let increase = 140;
        if (player.upgrades[1][6] === 1) { increase -= calculateEffects.S1Upgrade6(); }
        scaling[index] = increase / 100;

        if (index === 1) {
            if (!player.inflation.vacuum && player.upgrades[1][2] === 1) { firstCost /= 8; }
        } else if (index === 3) {
            if (player.upgrades[1][1] === 1) { firstCost /= 16; }
        } else if (index === 4) {
            if (player.upgrades[1][2] === 1) { firstCost /= 8; }
            if (player.researchesExtra[1][0] >= 1) { firstCost /= 16; }
        }
    } else if (stageIndex === 3) {
        if (player.strangeness[3][7] >= 1) { firstCost /= global.strangeInfo.stageBoost[3]; }
        if (index === 4) {
            scaling[4] = player.upgrades[3][11] === 1 ? 5 : 10;
        }
    } else if (stageIndex === 4) {
        let increase = 125 + 15 * index;
        if (player.elements[2] >= 1) { increase -= 10; }
        if (player.elements[8] >= 1) { increase -= 5; }
        scaling[index] = increase / 100;

        firstCost /= 2 ** player.strangeness[4][1];
        if (player.researchesExtra[4][3] >= 1) { firstCost /= global.collapseInfo.neutronEffect; }
        if (player.elements[13] >= 1) { firstCost /= 100; }
    } else if (stageIndex === 5) {
        if (index === 3) { scaling[3] = player.elements[31] >= 1 ? 1.1 : 1.11; }
    }

    return new Overlimit(scaling[index]).power(player.buildings[stageIndex][index as 1].true).multiply(firstCost);
};

export const assignPuddles = () => {
    const buildings = player.buildings[2];
    const upgrades = player.upgrades[2];

    let water5 = buildings[5].true;
    let water4 = buildings[4].true;
    let water3 = buildings[3].true;
    let water2 = buildings[2].true;
    if (upgrades[8] === 1) { water5 += buildings[6].true; }
    if (upgrades[7] === 1) { water4 += water5; }
    if (upgrades[6] === 1) { water3 += water4 * calculateEffects.S2Upgrade6(); }
    if (upgrades[5] === 1) { water2 += water3 * calculateEffects.S2Upgrade5(); }
    buildings[5].current.setValue(water5);
    buildings[4].current.setValue(water4);
    buildings[3].current.setValue(water3);
    buildings[2].current.setValue(water2);
};

const gainBuildings = (get: number, stageIndex: number, time: number) => {
    let stageGet = stageIndex;
    const add = new Overlimit(time);
    if (stageIndex === 1) {
        if (!player.inflation.vacuum && get < 5) { get += 2; }
        add.multiply(assignBuildingsProduction[`S1Build${get + 1}` as 'S1Build1']());
        if (!player.inflation.vacuum) { get -= 2; }
    } else if (stageIndex === 5) {
        add.multiply(assignBuildingsProduction.S5Build1()).divide(4 ** get);
        stageGet = 4;
        get++;
    } else {
        add.multiply(assignBuildingsProduction[`S${stageIndex}Build${get + 1}` as 'S2Build1']());
        if (stageIndex === 4) { get = 0; }
    }
    if (add.lessOrEqual('0')) { return; }
    if (!add.isFinite()) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error while gaining ${add} '${global.buildingsInfo.name[stageGet][get]}'`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }

    const building = player.buildings[stageGet][get];
    building.current.plus(add);
    building.total.plus(add);
    building.trueTotal.plus(add);

    if (stageIndex === 1) {
        if (player.inflation.vacuum) {
            if (get === 0) {
                player.buildings[3][0].current.setValue(building.current).multiply('1.78266192e-33');
                player.buildings[3][0].total.setValue(building.total).multiply('1.78266192e-33');
                awardMilestone(0, 3);
            } else if (get === 5) {
                player.buildings[2][0].current.setValue(building.current).divide('6.02214076e23');
            }
        }
    } else if (stageIndex === 2) {
        if (get === 1) {
            assignSubmergedLevels();
        }
    } else if (stageIndex === 3) {
        if (get === 0) { //False vacuum only
            if (player.accretion.rank < 5 && building.current.moreThan('1e30')) { building.current.setValue('1e30'); }
            awardMilestone(0, 3);
        }
    }
};

export const assignStrangeInfo = [
    () => { //[0] Quarks
        const vacuum = player.inflation.vacuum;
        const stageBoost = global.strangeInfo.stageBoost;
        const strangeQuarks = player.strange[0].current + 1;

        stageBoost[1] = strangeQuarks ** (vacuum ? 0.26 : 0.22);
        stageBoost[2] = strangeQuarks ** (vacuum ? 0.22 : 0.18);
        stageBoost[3] = strangeQuarks ** (vacuum ? 0.68 : 0.76);
        stageBoost[4] = strangeQuarks ** (player.elements[26] >= 1 ? 0.32 : 0.16);
        stageBoost[5] = strangeQuarks ** 0.06;
    }, () => { //[1] Strangelets
        const information = global.strangeInfo.strangeletsInfo;
        const strangelets = player.strange[1].current;

        information[0] = (Math.log2(strangelets + 2) - 1) / 100;
        information[1] = strangelets ** 0.4 / 80 + 1;
    }
];

const gainStrange = (time: number) => {
    const strange = player.strange[0];
    const add = global.strangeInfo.strangeletsInfo[0] * (global.strangeInfo.quarksGain / player.time.stage) * time;
    if (add <= 0) { return; }
    if (!isFinite(add)) {
        if (global.debug.errorGain) {
            global.debug.errorGain = false;
            Notify(`Error while gaining ${add} '${global.strangeInfo.name[0]}'`);
            setTimeout(() => { global.debug.errorGain = true; }, 6e4);
        }
        return;
    }
    strange.current += add;
    strange.total += add;
    assignStrangeInfo[0]();
};

const assignGlobalSpeed = () => {
    let speed = calculateEffects.inflation1();
    if (player.inflation.tree[0] >= 1) { speed *= 2; }
    if (player.inflation.vacuum && player.challenges.active === null && player.inflation.tree[0] >= 2) {
        speed *= calculateEffects.inflation0();
    }
    global.inflationInfo.globalSpeed = speed;
};

export const buyUpgrades = (upgrade: number, stageIndex: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.paused)) { return false; } //Auto should had already checked

    let free = false;
    let currency: Overlimit; //Readonly
    if (stageIndex === 1) {
        currency = new Overlimit(player.discharge.energy);
        if (player.inflation.vacuum) { free = player.accretion.rank >= 6 && player.strangeness[1][9] >= 1; }
    } else if (stageIndex === 2) {
        currency = player.buildings[2][1].current;
    } else if (stageIndex === 3) {
        currency = player.buildings[3][0].current;
    } else if (stageIndex === 6) {
        currency = player.buildings[6][0].current;
    } else {
        currency = player.buildings[4][0].current;
    }

    if (type === 'upgrades') {
        if (player.upgrades[stageIndex][upgrade] >= 1) { return false; }

        const pointer = global.upgradesInfo[stageIndex];
        const cost = pointer.startCost[upgrade];
        if (currency.lessThan(cost)) { return false; }

        player.upgrades[stageIndex][upgrade]++;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (stageIndex === 2) {
            if (upgrade === 3 || upgrade === 4) {
                assignBuildingsProduction.multipliersAll();
            } else if (upgrade >= 5 /*&& upgrade < 9*/) { assignPuddles(); }
        } else if (stageIndex === 4 && upgrade === 1 && global.tab === 'upgrade') { switchTab('upgrade'); }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New upgrade '${pointer.name[upgrade]}', has been created`; }
    } else if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];
        const level = player[type][stageIndex];

        if (level[upgrade] >= pointer.max[upgrade]) { return false; }
        let cost = pointer.cost[upgrade];
        if (currency.lessThan(cost)) { return false; }

        let newLevels = 1;
        if ((auto || (player.toggles.max[0] && player.stage.true >= 4)) && pointer.max[upgrade] > 1) {
            const scaling = pointer.scaling[upgrade]; //Must be >1 (>0 for Stage 1)
            if (stageIndex === 1) {
                if (free) {
                    newLevels = Math.min(Math.floor((currency.toNumber() - cost) / scaling + 1), pointer.max[upgrade] - level[upgrade]);
                } else {
                    const simplify = cost - scaling / 2;
                    newLevels = Math.min(Math.floor(((simplify ** 2 + 2 * scaling * currency.toNumber()) ** 0.5 - simplify) / scaling), pointer.max[upgrade] - level[upgrade]);
                    if (newLevels > 1) { cost = newLevels * (newLevels * scaling / 2 + simplify); }
                }
            } else {
                newLevels = Math.min(Math.floor(new Overlimit(currency).multiply(scaling - 1).divide(cost).plus('1').log(scaling).toNumber()), pointer.max[upgrade] - level[upgrade]);
                if (newLevels > 1) { cost = new Overlimit(scaling).power(newLevels).minus('1').divide(scaling - 1).multiply(cost).toNumber(); }
            }
        }

        level[upgrade] += newLevels;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (type === 'researches') {
            if (stageIndex === 1) {
                if (upgrade === 4) {
                    global.dischargeInfo.base = calculateEffects.goalsBase();
                }
            } else if (stageIndex === 2) {
                if (upgrade === 0 || upgrade === 1) {
                    assignSubmergedLevels();
                } else if (upgrade === 2 || upgrade === 3) {
                    assignBuildingsProduction.multipliersAll();
                } else if (upgrade >= 4 /*&& upgrade < 6*/) {
                    assignPuddles();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(0, 4, 'researches', true);
                }
            }
        } else if (type === 'researchesExtra') {
            if (stageIndex === 1) {
                if (upgrade === 2) {
                    let update = false;
                    if (player.stage.current < 4) {
                        player.stage.current = player.researchesExtra[1][2] > 1 ? 2 : 3;
                        if (player.toggles.normal[0] && player.stage.active < 4) {
                            setActiveStage(player.stage.current);
                            update = true;
                        }
                    }
                    stageUpdate(update, true);
                    awardVoidReward(1);
                }
            } else if (stageIndex === 2) {
                if (upgrade === 1) {
                    assignSubmergedLevels();
                }
            } else if (stageIndex === 4) {
                if (upgrade === 2 || upgrade === 3) {
                    calculateMaxLevel(1, 4, 'researches', true);
                    if (player.stage.active === 4) { setRemnants(); }
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for '${pointer.name[upgrade]}' ${type === 'researches' ? 'Stage' : ['', 'Energy', 'Cloud', 'Rank', 'Collapse', 'Galaxy'][player.stage.active]} Research`; }
    } else if (type === 'researchesAuto' || type === 'ASR') {
        if (type === 'ASR') { upgrade = stageIndex; }
        const pointer = global[`${type}Info`];
        const level = player[type];

        let effective = level[upgrade];
        if (effective >= pointer.max[upgrade]) { return false; }
        if (type === 'researchesAuto' && upgrade === 1 && player.strangeness[4][6] >= 1) { effective = Math.max(effective - 1, 0); }
        const cost = pointer.costRange[upgrade][effective];
        if (currency.lessThan(cost)) { return false; }

        level[upgrade]++;
        if (!free) { currency.minus(cost); }

        /* Special cases */
        if (type === 'researchesAuto') {
            if (upgrade === 1) {
                for (let i = 1; i < playerStart.elements.length; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 2) {
                if (player.inflation.vacuum) {
                    level[upgrade] = Math.max(level[upgrade] <= 1 && player.strangeness[3][4] < 1 ? 1 : level[upgrade] <= 2 && player.strangeness[2][4] < 1 ? 2 : level[upgrade] <= 3 && player.strangeness[4][4] < 1 ? 3 : 4, level[upgrade]);
                }
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${level[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(level[upgrade])} for '${type === 'ASR' ? pointer.name : pointer.name[upgrade]}' automatization Research`; }
    } else if (type === 'elements') {
        let level = player.elements[upgrade];
        if (level >= 1) { return false; }

        if (level === 0) {
            const cost = global.elementsInfo.startCost[upgrade];
            if (currency.lessThan(cost)) { return false; }
            /*if (!free) {*/ currency.minus(cost); //}
        } else if (!auto) { return false; }
        level = player.researchesAuto[1] >= 1 || level === 0.5 ? 1 : 0.5;
        player.elements[upgrade] = level;

        /* Special cases */
        if (player.collapse.show < upgrade) { player.collapse.show = upgrade; }
        if (level === 1) {
            if (upgrade === 7 || upgrade === 16 || upgrade === 20 || upgrade === 25 || upgrade === 28) {
                calculateMaxLevel(1, 4, 'researches', true);
            } else if (upgrade === 9 || upgrade === 17) {
                calculateMaxLevel(0, 4, 'researches', true);
            } else if (upgrade === 11) {
                calculateMaxLevel(2, 4, 'researches', true);
            } else if (upgrade === 26) {
                player.stage.current = 5;
                if (player.stage.true < 5) {
                    player.stage.true = 5;
                    player.event = false;
                    visualTrueStageUnlocks();
                }
                if (player.toggles.normal[0] && player.stage.active === 4 && (!player.inflation.vacuum || player.strangeness[5][3] >= 1)) {
                    setActiveStage(5);
                    stageUpdate(true, true);
                } else { stageUpdate(false, true); }
                assignStrangeInfo[0]();
                awardVoidReward(5);
            }
        }
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `New Element '${global.elementsInfo.name[upgrade]}' ${player.elements[upgrade] >= 1 ? 'obtained' : 'awaiting activation'}`; }
    }

    if (!free) {
        if (stageIndex === 1) {
            player.discharge.energy = Math.round(currency.toNumber());
        } else if (stageIndex === 2) {
            const drops = player.buildings[2][1];
            const old = drops.true;
            if (currency.lessThan(old) && player.buildings[2][2].current.lessThan('1')) {
                drops.true = Math.floor(currency.toNumber());
                if (player.inflation.vacuum) {
                    addEnergy(drops.true - old, 1, 2);
                } else if (currency.lessOrEqual('0')) {
                    player.buildings[2][0].current.max('2.7753108348135e-3');
                }
            }
        } else if (stageIndex === 3) {
            if (player.inflation.vacuum) { player.buildings[1][0].current.setValue(currency).divide('1.78266192e-33'); }
        }
    }

    if (type === 'upgrades' || type === 'elements') {
        visualUpdateUpgrades(upgrade, stageIndex, type);
    } else {
        if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(upgrade, stageIndex, type); }
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) { numbersUpdate(); }
    return true;
};

export const buyStrangeness = (upgrade: number, stageIndex: number, type: 'strangeness' | 'inflation', auto = false): boolean => {
    if (!auto && (!checkUpgrade(upgrade, stageIndex, type) || global.paused)) { return false; }

    if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        if (player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade]) { return false; }
        if (player.strange[0].current < pointer.cost[upgrade]) { return false; }

        player.strangeness[stageIndex][upgrade]++;
        player.strange[0].current -= pointer.cost[upgrade];

        /* Special cases */
        if (stageIndex === 1) {
            if (upgrade === 4) {
                if (player.researchesAuto[2] < 1 && (player.inflation.vacuum || player.stage.current === 1)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? (player.strangeness[3][4] < 1 ? 1 : player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : 4) : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[1] = global.ASRInfo.max[1];
                visualUpdateResearches(0, 1, 'ASR');
            } else if (upgrade === 7) {
                assignTrueEnergy();
            }
        } else if (stageIndex === 2) {
            if (upgrade === 2) {
                calculateMaxLevel(4, 2, 'researches', true);
                calculateMaxLevel(5, 2, 'researches', true);
            } else if (upgrade === 4) {
                if (player.inflation.vacuum ? player.researchesAuto[2] === 2 : (player.researchesAuto[2] < 1 && player.stage.current === 2)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? (player.strangeness[4][4] < 1 ? 3 : 4) : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[2] = global.ASRInfo.max[2];
                visualUpdateResearches(0, 2, 'ASR');
            } else if (upgrade === 8) {
                calculateMaxLevel(2, 2, 'researches', true);
                calculateMaxLevel(3, 2, 'researches', true);
            }
        } else if (stageIndex === 3) {
            if (upgrade === 2) {
                calculateMaxLevel(0, 3, 'researchesExtra', true);
                calculateMaxLevel(1, 3, 'researchesExtra', true);
            } else if (upgrade === 4) {
                if (player.inflation.vacuum ? player.researchesAuto[2] === 1 : (player.researchesAuto[2] < 1 && player.stage.current === 3)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? (player.strangeness[2][4] < 1 ? 2 : player.strangeness[4][4] < 1 ? 3 : 4) : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[3] = global.ASRInfo.max[3];
                visualUpdateResearches(0, 3, 'ASR');
            } else if (upgrade === 6) {
                if (player.researchesAuto[0] < player.strangeness[3][6]) {
                    player.researchesAuto[0] = player.strangeness[3][6];
                    visualUpdateResearches(0, 0, 'researchesAuto');
                }
            } else if (upgrade === 9) {
                global.debug.rankUpdated = null;
                assignMaxRank();
            }
        } else if (stageIndex === 4) {
            if (upgrade === 4) {
                if (player.inflation.vacuum ? player.researchesAuto[2] === 3 : (player.researchesAuto[2] < 1 && player.stage.current >= 4)) {
                    player.researchesAuto[2] = player.inflation.vacuum ? 4 : 1;
                    visualUpdateResearches(2, 0, 'researchesAuto');
                }
            } else if (upgrade === 5) {
                player.ASR[4] = global.ASRInfo.max[4];
                visualUpdateResearches(0, 4, 'ASR');
            } else if (upgrade === 6) {
                if (player.researchesAuto[1] < player.strangeness[4][6]) {
                    player.researchesAuto[1] = player.strangeness[4][6];
                    visualUpdateResearches(1, 0, 'researchesAuto');
                }
                for (let i = 1; i < playerStart.elements.length; i++) {
                    i = player.elements.indexOf(0.5, i);
                    if (i < 1) { break; }
                    buyUpgrades(i, 4, 'elements', true);
                }
            } else if (upgrade === 8) {
                if (player.elements[0] < 1) {
                    player.elements[0] = 1;
                    visualUpdateUpgrades(0, 4, 'elements');
                }
            }
        } else if (stageIndex === 5) {
            if (upgrade === 3) {
                if (player.inflation.vacuum) { stageUpdate(false, true); }
            } else if (upgrade === 4) {
                if (player.strangeness[5][5] >= 1) {
                    player.ASR[5] = global.ASRInfo.max[5];
                    visualUpdateResearches(0, 5, 'ASR');
                }
            } else if (upgrade === 5) {
                player.ASR[5] = player.strangeness[5][4] >= 1 ? global.ASRInfo.max[5] : 2;
                visualUpdateResearches(0, 5, 'ASR');
            }
        }
        assignStrangeInfo[0]();
        if (!auto && globalSave.SRSettings[0]) { getId('SRMain').textContent = `Level increased ${player.strangeness[stageIndex][upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.strangeness[stageIndex][upgrade])} for '${pointer.name[upgrade]}' Strangeness from ${global.stageInfo.word[stageIndex]} section`; }
    } else if (type === 'inflation') {
        const pointer = global.inflationTreeInfo;

        if (player.inflation.tree[upgrade] >= pointer.max[upgrade]) { return false; }
        if (player.cosmon.current < pointer.cost[upgrade]) { return false; }

        player.inflation.tree[upgrade]++;
        player.cosmon.current -= pointer.cost[upgrade];

        /* Special cases */
        if (upgrade === 0) {
            assignChallengeInformation();
            for (let s = 1; s < 6; s++) {
                for (let i = 0; i < playerStart.milestones[s].length; i++) {
                    assignMilestoneInformation(i, s);
                }
            }
        }
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Strength of Inflation Research '${pointer.name[upgrade]}' increased ${player.inflation.tree[upgrade] >= pointer.max[upgrade] ? 'and maxed at' : 'to'} ${format(player.inflation.tree[upgrade])}`; }
    }

    calculateResearchCost(upgrade, stageIndex, type);
    if (type === 'inflation') {
        visualUpdateInflation(upgrade);
    } else {
        visualUpdateResearches(upgrade, stageIndex, type);
    }
    if (!auto) { numbersUpdate(); }
    return true;
};

export const inflationRefund = async() => {
    const { tree } = player.inflation;
    const cosmon = player.cosmon;
    const challenge = player.challenges.active;
    if ((cosmon.current === cosmon.total && tree[0] < 1) || !await Confirm(`This will cause Stage reset to refund spended Cosmon${challenge !== null ? ' and restart current Challenge' : ''}, continue?`)) { return; }

    if (challenge !== null) {
        player.challenges.active = null;
        challengeReset(null, challenge);
    }
    stageFullReset();
    if (challenge !== null) {
        player.challenges.active = challenge;
        challengeReset(challenge, null);
    }

    cosmon.current = cosmon.total;
    for (let i = 0; i < playerStart.inflation.tree.length; i++) {
        tree[i] = 0;
        calculateResearchCost(i, 0, 'inflation');
    }
    visualUpdateInflation();

    /* Special cases */
    assignChallengeInformation();
    for (let s = 1; s < 6; s++) { //Due to index 0
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            assignMilestoneInformation(i, s);
        }
    }
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Cosmon has been refunded'; }
};

//Currently can't allow price to be more than 2**1024. Because missing sorting function for numbers that big
export const calculateResearchCost = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'strangeness' | 'inflation') => {
    if (type === 'researches' || type === 'researchesExtra') {
        const pointer = global[`${type}Info`][stageIndex];

        pointer.cost[research] = stageIndex === 1 ?
            pointer.startCost[research] + pointer.scaling[research] * player[type][stageIndex][research] :
            pointer.startCost[research] * pointer.scaling[research] ** player[type][stageIndex][research];
    } else if (type === 'strangeness') {
        const pointer = global.strangenessInfo[stageIndex];

        pointer.cost[research] = player.inflation.vacuum ?
            Math.floor(Math.round((pointer.startCost[research] * pointer.scaling[research] ** player.strangeness[stageIndex][research]) * 100) / 100) :
            Math.floor(Math.round((pointer.startCost[research] + pointer.scaling[research] * player.strangeness[stageIndex][research]) * 100) / 100);
    } else if (type === 'inflation') {
        const pointer = global.inflationTreeInfo;

        pointer.cost[research] = Math.floor(Math.round((pointer.startCost[research] + pointer.scaling[research] * player.inflation.tree[research]) * 100) / 100);
    }
};

export const calculateMaxLevel = (research: number, stageIndex: number, type: 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'strangeness', addAuto = false) => {
    let max = null;
    if (type === 'researches') {
        if (stageIndex === 2) {
            if (research === 2) {
                max = 4;
                if (player.strangeness[2][8] >= 1) { max += 3; }
            } else if (research === 3) {
                max = 4;
                if (player.strangeness[2][8] >= 2) { max++; }
            } else if (research === 4) {
                max = 2;
                if (player.strangeness[2][2] >= 1) { max++; }
            } else if (research === 5) {
                max = 1;
                if (player.strangeness[2][2] >= 2) { max++; }
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 3 + (3 * player.researches[4][2]) + (3 * player.researches[4][3]);
                if (player.elements[9] >= 1) { max += 12; }
                if (player.elements[17] >= 1) { max += 24; }
            } else if (research === 1) {
                max = 2 + player.researchesExtra[4][2] + player.researchesExtra[4][3];
                if (player.elements[7] >= 1) { max += 2; }
                if (player.elements[16] >= 1) { max++; }
                if (player.elements[20] >= 1) { max++; }
                if (player.elements[25] >= 1) { max++; }
                if (player.elements[28] >= 1) { max++; }
            } else if (research === 2) {
                max = 1;
                if (player.elements[11] >= 1) { max++; }
            }
        } else if (stageIndex === 5) {
            if (research === 0) {
                max = player.inflation.vacuum ? 4 : 3;
            } else if (research === 1) {
                max = player.inflation.vacuum ? 4 : 3;
            }
        }
    } else if (type === 'researchesExtra') {
        if (stageIndex === 3) {
            if (research === 0) {
                max = Math.floor(14 + (2 * calculateEffects.effectiveRank()));
                if (player.strangeness[3][2] >= 1) { max += 6; }
            } else if (research === 1) {
                max = 6;
                if (player.strangeness[3][2] >= 2) { max += 2; }
            } else if (research === 4) {
                max = player.accretion.rank - 2;
            }
        }
    } else if (type === 'researchesAuto') {
        if (research === 2) {
            max = player.inflation.vacuum ? 4 : 1;
        }
    } else if (type === 'ASR') {
        if (stageIndex === 1) {
            max = player.inflation.vacuum ? 5 : 3;
        } else if (stageIndex === 2) {
            max = player.inflation.vacuum ? 6 : 5;
        } else if (stageIndex === 3) {
            max = player.inflation.vacuum ? 5 : 4;
        } else if (stageIndex === 4) {
            max = player.inflation.vacuum ? 5 : 4;
        }
    } else if (type === 'strangeness') {
        if (stageIndex === 1) {
            if (research === 0) {
                max = 6;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 2) {
            if (research === 1) {
                max = 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 3) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 3) {
            if (research === 0) {
                max = 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            }
        } else if (stageIndex === 4) {
            if (research === 0) {
                max = 8;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 1) {
                max = 4;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 4) {
                max = player.inflation.vacuum && player.challenges.void[4] >= 1 ? 2 : 1;
            } else if (research === 6) {
                max = player.inflation.vacuum || global.milestonesInfoS6.active[2] || player.milestones[4][0] >= 8 ? 2 : 1;
            }
        } else if (stageIndex === 5) {
            if (research === 2) {
                max = 2;
                if (player.inflation.vacuum) { max += Math.min(player.challenges.void[3], 4); }
            } else if (research === 6) {
                max = !player.inflation.vacuum && player.milestones[5][0] >= 8 ? 2 : 1;
            }
        }
    }
    if (max !== null) {
        if (max < 0) { max = 0; }
        if (type === 'researchesAuto' || type === 'ASR') {
            global[`${type}Info`].max[type === 'ASR' ? stageIndex : research] = max;
        } else {
            global[`${type}Info`][stageIndex].max[research] = max;
        }
    }

    if (type !== 'researchesAuto' && type !== 'ASR') { calculateResearchCost(research, stageIndex, type); }
    visualUpdateResearches(research, stageIndex, type);
    if (addAuto && (type === 'researches' || type === 'researchesExtra')) { autoResearchesAddOne(type, [stageIndex, research]); }
};

export const autoUpgradesSet = (which: number) => {
    if (!player.toggles.auto[5]) { return; }
    const array = [];
    const level = player.upgrades[which];
    const pointer = global.upgradesInfo[which];
    for (let i = 0; i < pointer.maxActive; i++) {
        if (level[i] < 1) { array.push(i); }
    }
    global.automatization.autoU[which] = array.sort((a, b) => pointer.startCost[a] - pointer.startCost[b]);
};

const autoUpgradesBuy = (stageIndex: number) => {
    if (!player.toggles.auto[5] || player.researchesAuto[0] < 1) { return; }
    const auto = global.automatization.autoU[stageIndex];

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, stageIndex, 'upgrades')) { continue; }
        buyUpgrades(index, stageIndex, 'upgrades', true);

        if (player.upgrades[stageIndex][index] >= 1) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

export const autoResearchesSet = (type: 'researches' | 'researchesExtra', which: number) => {
    if (!player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }
    const array = [];
    const level = player[type][which];
    const pointer = global[`${type}Info`][which];
    for (let i = 0; i < pointer.maxActive; i++) {
        if (level[i] < pointer.max[i]) { array.push(i); }
    }
    global.automatization[type === 'researches' ? 'autoR' : 'autoE'][which] = array.sort((a, b) => pointer.cost[a] - pointer.cost[b]);
};
/** Add only 1 Research for [stage, research] if it isn't already present */
const autoResearchesAddOne = (type: 'researches' | 'researchesExtra', which: number[]) => {
    if (!player.toggles.auto[type === 'researches' ? 6 : 7]) { return; }
    const [s, a] = which;
    const pointer = global[`${type}Info`][s];
    if (player[type][s][a] >= pointer.max[a]) { return; }

    let newIndex;
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][s];
    for (let i = 0; i < auto.length; i++) {
        if (auto[i] === a) { return; }
        if (newIndex === undefined && pointer.cost[a] < pointer.cost[auto[i]]) {
            newIndex = i;
        }
    }
    if (newIndex !== undefined) {
        auto.splice(newIndex, 0, a);
    } else { auto.push(a); }
};

const autoResearchesBuy = (type: 'researches' | 'researchesExtra', stageIndex: number) => {
    if (type === 'researches') {
        if (!player.toggles.auto[6] || player.researchesAuto[0] < 2) { return; }
    } else /*if (type === 'researchesExtra')*/ {
        if (!player.toggles.auto[7] || player.researchesAuto[0] < 3) { return; }
    }
    const auto = global.automatization[type === 'researches' ? 'autoR' : 'autoE'][stageIndex];
    const pointer = global[`${type}Info`][stageIndex];

    let sort = false;
    for (let i = 0; i < auto.length; i++) {
        if (!checkUpgrade(auto[i], stageIndex, type)) { continue; }
        const bought = buyUpgrades(auto[i], stageIndex, type, true);

        if (player[type][stageIndex][auto[i]] >= pointer.max[auto[i]]) {
            auto.splice(i, 1);
            i--;
        } else if (!bought) {
            if (pointer.cost[auto[i]] > pointer.cost[auto[i + 1]]) {
                sort = true;
                continue;
            }
            break;
        }
    }
    if (sort) { auto.sort((a, b) => pointer.cost[a] - pointer.cost[b]); }
};

export const autoElementsSet = () => {
    if (!player.toggles.auto[8]) { return; }

    const array = [];
    const elements = player.elements;
    for (let i = 1; i < (player.inflation.vacuum ? playerStart.elements.length : 29); i++) {
        if (elements[i] < 1) { array.push(i); }
    }
    global.automatization.elements = array;
};

const autoElementsBuy = () => {
    if (!player.toggles.auto[8] || player.researchesAuto[1] < 2) { return; }
    const auto = global.automatization.elements;
    const elements = player.elements;

    for (let i = 0; i < auto.length; i++) {
        const index = auto[i];

        if (!checkUpgrade(index, 4, 'elements')) { break; }
        buyUpgrades(index, 4, 'elements', true);

        if (elements[index] > 0) {
            auto.splice(i, 1);
            i--;
        } else { break; }
    }
};

export const toggleSwap = (number: number, type: 'buildings' | 'normal' | 'hover' | 'max' | 'auto', change = false) => {
    const toggles = type === 'buildings' ? player.toggles.buildings[player.stage.active] : player.toggles[type];

    if (change) {
        if (global.paused) { return; }
        if (type === 'buildings') {
            const maxLength = playerStart.buildings[player.stage.active].length;
            if (number === 0) {
                toggles[0] = !toggles[0];
                for (let i = 1; i < maxLength; i++) {
                    toggles[i] = toggles[0];
                    toggleSwap(i, 'buildings');
                }
            } else {
                if (number >= maxLength) { return; }

                let anyOn = false;
                toggles[number] = !toggles[number];
                for (let i = 1; i <= player.ASR[player.stage.active]; i++) {
                    if (toggles[i]) {
                        anyOn = true;
                        break;
                    }
                }
                if (toggles[0] !== anyOn) {
                    toggles[0] = anyOn;
                    toggleSwap(0, 'buildings');
                }
            }
        } else { toggles[number] = !toggles[number]; }
    }

    let extraText;
    let toggleHTML;
    if (type === 'buildings') {
        toggleHTML = getId(`toggleBuilding${number}`);
        extraText = number === 0 ? 'All ' : 'Auto ';
    } else if (type === 'hover') {
        toggleHTML = getId(`toggleHover${number}`);
        extraText = 'Hover to create ';
    } else if (type === 'max') {
        toggleHTML = getId(`toggleMax${number}`);
        extraText = 'Max create ';
    } else if (type === 'auto') {
        toggleHTML = getId(`toggleAuto${number}`);
        extraText = 'Auto ';
    } else {
        toggleHTML = getId(`toggleNormal${number}`);
        extraText = '';
    }

    if (!toggles[number]) {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = `${extraText}OFF`;
    } else {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = `${extraText}ON`;
    }
};

export const toggleConfirm = (number: number, change = false) => {
    const toggles = player.toggles.confirm;
    if (change) { toggles[number] = toggles[number] === 'Safe' ? 'None' : 'Safe'; }

    const toggleHTML = getId(`toggleConfirm${number}`);
    toggleHTML.textContent = toggles[number];
    if (toggles[number] === 'Safe') {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
    } else {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
    }
};

const assignQuarksGain = () => {
    global.strangeInfo.quarksGain = calculateEffects.strangeGain(true);
};

export const stageResetCheck = (stageIndex: number, quarks = null as number | null): boolean => {
    const allowedChallenge = player.challenges.active === null || global.challengesInfo.reset[player.challenges.active] !== 'stage';
    if (stageIndex === 5) {
        assignQuarksGain(); //Also visually updates numbers
        if (quarks !== null) {
            if (player.elements[26] < 0.5) { return false; }

            const { stage } = player;
            const peakCheck = global.strangeInfo.quarksGain / player.time.stage;
            if (stage.peak < peakCheck) { stage.peak = peakCheck; }

            if (player.elements[26] < 1) { return false; }
            if (player.strange[1].current > 0) { gainStrange(quarks); }

            if (!player.toggles.auto[0] || player.strangeness[5][6] < (player.inflation.vacuum ? 1 : 2) || !allowedChallenge ||
                (stage.input[0] <= 0 && stage.input[1] <= 0) || stage.input[0] > global.strangeInfo.quarksGain || stage.input[1] > player.time.stage) { return false; }
            stageResetReward(stageIndex);
            return true;
        }
        return allowedChallenge && player.elements[26] >= 1;
    } else if (stageIndex === 3) {
        if (player.buildings[3][0].current.lessThan('2.45576045e31')) { return false; }
    } else if (stageIndex === 2) {
        if (player.buildings[2][1].current.lessThan('1.19444e29')) { return false; }
    } else if (stageIndex === 1) {
        if (player.buildings[1][3].current.lessThan('1.67133125e21')) { return false; }
    } else { return false; }

    if (!allowedChallenge) { return false; }
    if (quarks !== null) { //Just checks if auto
        if (player.strangeness[5][6] < 1) { return false; }
        if (player.toggles.normal[2]) { //False vacuum only
            const info = global.milestonesInfo[stageIndex];
            for (let i = 0; i < info.max.length; i++) {
                if (player.milestones[stageIndex][i] < info.max[i] && info.time[i] >= player.time.stage) { return false; }
            }
        }
        stageResetReward(stageIndex);
    }
    return true;
};
export const stageResetUser = async() => {
    if (global.paused) { return; }
    const active = player.inflation.vacuum || (player.stage.active === 4 && (player.stage.true >= 7 || player.event)) ? 5 : player.stage.active;
    if (!stageResetCheck(active)) { return; }

    if (player.toggles.confirm[0] !== 'None') {
        let errorText = '';
        if (player.upgrades[5][3] === 1) {
            assignMergeReward();
            const universeCost = calculateBuildingsCost(1, 6);
            if (universeCost.lessOrEqual(player.merge.reward[0] + (calculateMergeMaxResets() < player.merge.resets ? global.mergeInfo.checkReward[0] : 0))) {
                errorText += `can create an Universe${universeCost.moreThan(player.merge.reward[0]) ? ' after Merge' : ''}`;
            }
        }
        if (player.researchesExtra[5][0] >= 1) {
            const galaxyCost = calculateBuildingsCost(3, 5);
            if (galaxyCost.lessOrEqual(Math.max(player.collapse.mass, global.collapseInfo.newMass))) {
                if (errorText !== '') { errorText += '\nAlso '; }
                errorText += `can afford a Galaxy${galaxyCost.moreThan(player.collapse.mass) ? ' after Collapse' : ''}`;
            }
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Stage reset because ${errorText}\nReset anyway?`)) { return; }
            if (!stageResetCheck(active)) { return Notify('Stage reset canceled, requirements are no longer met'); }
        }
    }
    if (globalSave.SRSettings[0]) {
        let message;
        if (player.stage.true >= 5) {
            message = `Caused Stage reset for ${format(active >= 4 ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false))} Strange quarks`;
            const strangelets = player.strangeness[5][8] >= 1 ? calculateEffects.strangeGain(active >= 4, 1) : 0;
            if (strangelets > 0) { message += ` and ${format(strangelets)} Strangelets`; }
        } else { message = `${global.stageInfo.word[player.stage.true]} Stage ended, but new one started`; }
        getId('SRMain').textContent = message;
    }
    stageResetReward(active);
};

const stageResetReward = (stageIndex: number) => {
    const { stage } = player;

    stage.resets++;
    let fullReset = true;
    let update: null | boolean = true;
    const resetThese = player.inflation.vacuum ? [1, 2, 3, 4, 5] : [stageIndex];
    if (player.inflation.vacuum) {
        if (stage.active === 1 || stage.active >= 6) {
            update = false;
        } else { setActiveStage(1); }
        stage.current = 1;
        if (stage.true >= 7) {
            resetThese.push(6);
        } else if (stage.resets < 2) { playEvent(7); }
    } else if (stageIndex === stage.current) {
        if (stageIndex < 4) {
            const check = stage.current === stage.active;
            stage.current++;
            if (stage.current === 2 && player.milestones[2][1] >= 7) { stage.current++; }
            if (stage.current === 3 && player.milestones[3][1] >= 7) { stage.current++; }
            if (check) {
                setActiveStage(stage.current);
            } else { update = false; }
            if (stage.current > stage.true) {
                stage.true = stage.current;
                player.event = false;
                visualTrueStageUnlocks();
            }
        } else {
            stage.current = player.milestones[1][1] < 6 ? 1 : player.milestones[2][1] < 7 ? 2 : player.milestones[3][1] < 7 ? 3 : 4;
            if ((stage.active === 4 && stage.current !== 4) || stage.active === 5) {
                setActiveStage(stage.current);
            } else { update = false; }
            resetThese.unshift(4);
        }
        if (stage.true >= 7) { resetThese.push(6); }
    } else {
        update = stageIndex === stage.active ? false : null;
        fullReset = false;
    }

    if (stage.true >= 5) {
        const { strange } = player;
        const exportReward = player.time.export;
        const quarks = stageIndex >= 4 ? global.strangeInfo.quarksGain : calculateEffects.strangeGain(false);
        const strangelets = player.strangeness[5][8] >= 1 ? calculateEffects.strangeGain(stageIndex >= 4, 1) : 0;
        strange[0].current += quarks;
        strange[0].total += quarks;
        if (strangelets > 0) {
            strange[1].current += strangelets;
            strange[1].total += strangelets;
            if (strangelets > exportReward[2]) { exportReward[2] = strangelets; }
            assignStrangeInfo[1]();
        }
        if (quarks > exportReward[1]) { exportReward[1] = quarks; }
        if (resetThese.includes(4)) { player.elements[26] = 0; } //Lazy fix for Strange boost
        assignStrangeInfo[0]();

        if (stageIndex >= 4) {
            const history = player.history.stage;
            const storage = global.historyStorage.stage;
            const realTime = player.time.stage;
            storage.unshift([realTime, quarks, strangelets, 0]);
            if (storage.length > 100) { storage.length = 100; }
            if (quarks / realTime > history.best[1] / history.best[0]) {
                history.best = [realTime, quarks, strangelets, 0];
            }
        }
    }

    resetStage(resetThese, update, fullReset);
};
/* Export if required */
const stageFullReset = () => {
    const vacuum = player.inflation.vacuum;
    const current = vacuum ? 5 : player.stage.current;
    if (!vacuum) {
        if (current !== 1 && player.milestones[1][1] >= 6) {
            if (stageResetCheck(1)) {
                stageResetReward(1);
            } else { resetStage([1], false, false); }
        }
        if (current !== 2 && player.milestones[2][1] >= 7) {
            if (stageResetCheck(2)) {
                stageResetReward(2);
            } else { resetStage([2], false, false); }
        }
        if (current !== 3 && player.milestones[3][1] >= 7) {
            if (stageResetCheck(3)) {
                stageResetReward(3);
            } else { resetStage([3], false, false); }
        }
    }

    if (stageResetCheck(current)) {
        stageResetReward(current);
    } else {
        const resetThese = vacuum ? [1, 2, 3, 4, 5] : [current];
        if (player.stage.true >= 7) { resetThese.push(6); }
        let update = false;
        if (vacuum) {
            if (player.stage.active !== 1 && player.stage.active < 6) {
                setActiveStage(1);
                update = true;
            }
            player.stage.current = 1;
        }
        resetStage(resetThese, update);
    }
};

export const switchStage = (stage: number, active = stage) => {
    if (!global.stageInfo.activeAll.includes(stage) || player.stage.active === stage) {
        if (player.stage.active === stage && global.trueActive !== stage) {
            global.trueActive = stage;
            getId(`stageSwitch${stage}`).style.textDecoration = 'underline';
        }
        if (!global.paused) {
            visualUpdate();
            numbersUpdate();
        }
        return;
    }

    setActiveStage(stage, active);
    stageUpdate();
};

/** Doesn't check for Stage being unlocked, requires stageUpdate() call afterwards */
export const setActiveStage = (stage: number, active = stage) => {
    getId(`stageSwitch${player.stage.active}`).style.textDecoration = '';
    player.stage.active = stage;
    global.trueActive = active;
    getId(`stageSwitch${stage}`).style.textDecoration = 'underline' + (global.trueActive !== stage ? ' dashed' : '');

    if (global.tab === 'inflation') {
        if (stage !== 6) { switchTab('upgrade'); }
    } else if (global.tab === 'Elements') {
        if (stage !== 4 && stage !== 5) { switchTab('upgrade'); }
    }
    if (global.tab === 'upgrade') {
        if (global.subtab.upgradeCurrent === 'Elements' && stage !== 4 && stage !== 5) { switchTab('upgrade', 'Upgrades'); }
    }
};

/** And scaling */
const assignDischargeCost = () => {
    let scale = (2 * player.researches[1][3]) + (player.strangeness[1][2] / 2);
    if (player.challenges.superVoid[1] >= 1 && (player.inflation.tree[3] >= 1 || player.challenges.active === 0)) { scale++; }
    global.dischargeInfo.next = Math.round((10 - scale) ** player.discharge.current);
    global.dischargeInfo.scaling = 10 - scale;
};
/** Also will assign energyType */
export const assignTrueEnergy = () => {
    const energyType = player.inflation.vacuum ? [[],
        [0, 1, 3, 5, 10, 20],
        [0, 20, 30, 40, 50, 60, 120],
        [0, 20, 40, 60, 120, 160],
        [0, 80, 160, 240, 320, 400],
        [0, 400, 400, 2000]
    ] : [[], [0, 1, 5, 20], [], [], [], []];

    let energyTrue = 0;
    for (let s = 1; s < energyType.length; s++) {
        let add = 0;
        for (let i = 1; i < energyType[s].length; i++) {
            let value = energyType[s][i];
            if (s === 1) {
                if (i === 1 && player.inflation.vacuum) { value += player.strangeness[1][7] * 2; }
            } else if (player.challenges.active === 0) { value /= 2; }

            add += value * player.buildings[s][i as 1].true;
            energyType[s][i] = value;
        }
        global.dischargeInfo.energyStage[s] = add;
        energyTrue += add;
    }
    global.dischargeInfo.energyType = energyType;
    global.dischargeInfo.energyTrue = energyTrue;
};

const dischargeResetCheck = (goals = false): boolean => {
    assignDischargeCost(); //Also visually updates numbers
    if (player.upgrades[1][5] !== 1) { return false; }
    const info = global.dischargeInfo;
    const energy = player.discharge.energy;
    const level = player.strangeness[1][4];

    if (goals) {
        if (level >= 2 && energy >= info.next) {
            dischargeReset(true);
            if (!player.toggles.auto[1]) { return false; }
            assignDischargeCost();
        } else if (!player.toggles.auto[1] || (level < 1 && (player.researchesAuto[2] < 1 || (!player.inflation.vacuum && player.stage.current !== 1)))) { return false; }

        if (energy >= info.energyTrue && (level >= 2 || energy < info.next)) { return false; }
        dischargeReset();
        return true;
    }
    return energy < info.energyTrue || (level < 2 && energy >= info.next);
};
export const dischargeResetUser = async() => {
    if (global.paused || !dischargeResetCheck()) { return; }

    if (player.toggles.confirm[1] !== 'None') {
        if (player.stage.active !== 1) {
            if (!await Confirm("Prevented Discharge because current active Stage isn't Microworld\nReset anyway?")) { return; }
            if (!dischargeResetCheck()) { return Notify('Discharge canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Caused Discharge to reset spent Energy${player.discharge.energy >= global.dischargeInfo.next ? ', also reached new goal' : ''}`; }
    dischargeReset();
    numbersUpdate();
};

const dischargeReset = (noReset = false) => {
    if (player.discharge.energy >= global.dischargeInfo.next) {
        player.discharge.current++;
        if (!noReset) {
            player.discharge.energy -= global.dischargeInfo.next;
        } //else { global.dischargeInfo.total = calculateEffects.effectiveGoals(); }
    }
    awardVoidReward(1);
    if (!noReset) { reset('discharge', [1]); }
};

const assignNewClouds = () => {
    const softcap = player.challenges.active === 0 ? 0.4 : player.inflation.vacuum ? 0.5 : 0.6;
    global.vaporizationInfo.get.setValue(player.vaporization.clouds).power(1 / softcap).plus(
        new Overlimit(player.buildings[2][1][player.researchesExtra[2][0] >= 1 ? 'total' : 'current']).divide(calculateEffects.S2Upgrade2())
    ).power(softcap).minus(player.vaporization.clouds);
};

const vaporizationResetCheck = (clouds = null as number | null): boolean => {
    assignNewClouds(); //Also visually updates numbers
    if (player.upgrades[2][2] < 1 || global.vaporizationInfo.get.lessOrEqual('0')) { return false; } //Can be negative

    if (clouds !== null) {
        const level = player.strangeness[2][4];
        if (level >= 2) {
            vaporizationReset(clouds);
            if (!player.toggles.auto[2] || player.toggles.normal[1]) { return false; }
            assignNewClouds();
        } else if (!player.toggles.auto[2] || (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 3 : (player.researchesAuto[2] < 1 || player.stage.current !== 2)))) { return false; }

        const vaporization = player.vaporization;
        if (player.inflation.vacuum && vaporization.input[1] > 0 && vaporization.clouds.moreOrEqual(vaporization.input[1])) { return false; }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
        if (calculateEffects.clouds(true).divide(calculateEffects.clouds()).multiply((rainAfter / rainNow) * storm).lessThan(vaporization.input[0])) { return false; }
        vaporizationReset();
    }
    return true;
};
export const vaporizationResetUser = async() => {
    if (global.paused || !vaporizationResetCheck()) { return; }

    if (player.toggles.confirm[2] !== 'None') {
        let errorText = '';
        if (player.strangeness[2][4] >= 2) {
            errorText += 'already gaining Clouds without needing to reset';
        }
        const rainNow = calculateEffects.S2Extra1(player.researchesExtra[2][1]);
        const rainAfter = calculateEffects.S2Extra1(player.researchesExtra[2][1], true);
        const storm = calculateEffects.S2Extra2(rainAfter) / calculateEffects.S2Extra2(rainNow);
        if (calculateEffects.clouds(true).divide(calculateEffects.clouds()).multiply((rainAfter / rainNow) * storm).lessThan('2')) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += 'boost from doing it is below 2x';
        }
        if (player.stage.active !== 2) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += "current active Stage isn't Submerged";
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Vaporization because ${errorText}\nReset anyway?`)) { return; }
            if (!vaporizationResetCheck()) { return Notify('Vaporization canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) {
        getId('SRMain').textContent = `Caused Vaporization for ${format(global.vaporizationInfo.get)} Clouds, +${format(player.vaporization.clouds.moreThan('0') ? new Overlimit(global.vaporizationInfo.get).divide(player.vaporization.clouds).multiply('1e2') : 100)}%`;
    }
    vaporizationReset();
    numbersUpdate();
};

const vaporizationReset = (autoClouds = null as number | null) => {
    const vaporization = player.vaporization;

    if (autoClouds !== null) {
        vaporization.clouds.plus(new Overlimit(global.vaporizationInfo.get).multiply(autoClouds / 40));
    } else {
        vaporization.clouds.plus(global.vaporizationInfo.get);
        if (player.stage.true === 2) { global.vaporizationInfo.get.setValue('0'); }
    }
    if (vaporization.cloudsMax.lessThan(vaporization.clouds)) { vaporization.cloudsMax.setValue(vaporization.clouds); }
    awardVoidReward(2);
    if (autoClouds === null) { reset('vaporization', player.inflation.vacuum ? [1, 2] : [2]); }
};

export const assignMaxRank = () => {
    if (player.inflation.vacuum) {
        global.accretionInfo.maxRank = player.strangeness[3][9] >= 1 ? 7 : 6;
    } else {
        global.accretionInfo.maxRank = player.stage.true >= 4 || (player.stage.true === 3 && player.event) ? 5 : 4;
    }
};

const rankResetCheck = (auto = false): boolean => {
    const rank = player.accretion.rank;
    const info = global.accretionInfo;
    if (rank >= info.maxRank) { return false; }
    const level = player.strangeness[3][4];

    if (player.challenges.active === 0 && rank >= 6) {
        const scaling = global.buildingsInfo.increase[5][3]; //Will require updating if anything will make Galaxies (not scaling) cheaper
        if (player.buildings[5][3].true < logAny(info.rankCost[rank] / 1.98847e38 * (scaling - 1) + 1, scaling)) { return false; }
    } else if ((player.buildings[3][0][level >= 2 ? 'total' : 'current']).lessThan(info.rankCost[rank])) {
        return false;
    }

    if (auto) {
        if (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 2 : (player.researchesAuto[2] < 1 || player.stage.current !== 3))) { return false; }
        rankReset();
    }
    return true;
};
export const rankResetUser = async() => {
    if (global.paused || !rankResetCheck()) { return; }

    if (player.toggles.confirm[3] !== 'None' && player.accretion.rank !== 0) {
        let errorText = '';
        if (player.inflation.vacuum && (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds.lessOrEqual('0')) && player.accretion.rank >= 4) {
            errorText += `current ${player.researchesExtra[2][1] <= 0 ? "level for Cloud Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make next Rank slow`;
        }
        if (player.stage.active !== 3) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += "current active Stage isn't Accretion";
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Rank increase because ${errorText}\nReset anyway?`)) { return; }
            if (!rankResetCheck()) { return Notify('Rank increase canceled, requirements are no longer met'); }
        }
    }

    rankReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = `Rank increased to '${global.accretionInfo.rankName[player.accretion.rank]}' (Rank number is ${player.accretion.rank})`; }
};

const rankReset = () => {
    player.accretion.rank++;
    if (player.accretion.rank === 6) {
        player.stage.current = 4;
        if (player.toggles.normal[0] && player.stage.active < 4) {
            setActiveStage(4);
            stageUpdate(true, true);
        } else { stageUpdate(false, true); }
    }
    awardVoidReward(3);
    reset('rank', player.inflation.vacuum ? [1, 2, 3] : [3]);
    calculateMaxLevel(0, 3, 'researchesExtra', true);
    calculateMaxLevel(4, 3, 'researchesExtra', true);
    if (player.stage.active === 3) { visualUpdate(); }
};

const calculateMassGain = (): number => {
    const elements = player.elements;

    let massGain = 0.004;
    if (elements[3] >= 1) { massGain += 0.002; }
    if (elements[5] >= 1) { massGain += 0.0002 * player.buildings[4][1].true; }
    massGain *= elements[15] >= 1 ? global.collapseInfo.trueStars : player.buildings[4][1].true;
    if (player.inflation.vacuum) {
        massGain = (massGain * (player.challenges.active === 0 ? 48 : 96)) + 1;
    } else {
        if (elements[10] >= 1) { massGain *= 2; }
        if (player.researchesExtra[4][1] >= 1) { massGain *= calculateEffects.S4Extra1(); }
        massGain *= calculateEffects.star[2]();
        if (player.strangeness[5][7] >= 1) { massGain *= global.strangeInfo.stageBoost[5]; }
    }
    return massGain;
};

const assignNewMass = () => {
    if (player.inflation.vacuum) {
        assignSharedHardcapDelays();
        assignSolarMassHardcap();
        global.collapseInfo.newMass = Math.min(player.buildings[1][0].current.toNumber() * 8.96499278339628e-67, global.inflationInfo.massCap); //1.78266192e-33 / 1.98847e33
    } else { global.collapseInfo.newMass = calculateMassGain(); }
};
const assignNewRemnants = () => {
    const building = player.buildings[4];
    const starCheck = global.collapseInfo.starCheck;
    const stars = player.collapse.stars;
    starCheck[0] = building[2].trueTotal.moreThan('0') ? Math.max(building[2].true + Math.floor(building[1].true * player.strangeness[4][3] / 10) - stars[0], 0) : 0;
    starCheck[1] = Math.max(building[3].true - stars[1], 0);
    starCheck[2] = Math.max(building[4].true + (building[5].true * player.researches[4][5]) - stars[2], 0);
};

const collapseResetCheck = (remnants = false): boolean => {
    assignNewRemnants(); //Also visually updates numbers
    assignNewMass(); //Required for Milestones
    if (player.upgrades[4][0] < 1) { return false; }
    const info = global.collapseInfo;
    const collapse = player.collapse;
    const level = player.strangeness[4][4];

    if (remnants) {
        if (level >= 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) {
            collapseReset(true);
            if (!player.toggles.auto[4]) { return false; }
            info.starCheck[0] = 0;
            info.starCheck[1] = 0;
            info.starCheck[2] = 0;
            assignNewMass();
        } else if (!player.toggles.auto[4] || (level < 1 && (player.inflation.vacuum ? player.researchesAuto[2] < 4 : (player.researchesAuto[2] < 1 || player.stage.current < 4)))) { return false; }

        if (player.strangeness[5][4] >= 1 && player.toggles.buildings[5][3] && player.ASR[5] >= 3 && player.researchesExtra[5][0] >= 1 && calculateBuildingsCost(3, 5).lessOrEqual(info.newMass)) {
            collapseReset();
            return true;
        }
        if (player.inflation.vacuum) {
            const timeUntil = new Overlimit(global.inflationInfo.massCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).divide(global.buildingsInfo.producing[1][1]).toNumber() / global.inflationInfo.globalSpeed;
            if (timeUntil < collapse.input[1] && timeUntil > 0) { return false; }
        }
        while (info.pointsLoop < collapse.points.length) {
            const point = collapse.points[info.pointsLoop];
            if (point > info.newMass || (point > 40 && player.strangeness[5][4] < 1)) { break; }
            if (point > collapse.mass) {
                info.pointsLoop++;
                collapseReset();
                return true;
            }
            info.pointsLoop++;
        }
        const massBoost = (calculateEffects.mass(true) / calculateEffects.mass()) * (calculateEffects.S4Research4(true) / calculateEffects.S4Research4()) * ((1 + (calculateEffects.S5Upgrade2(true) - calculateEffects.S5Upgrade2()) / global.mergeInfo.galaxyBase) ** (player.buildings[5][3].true * 2));
        if (massBoost >= collapse.input[0]) {
            collapseReset();
            return true;
        } else if (level >= 2) { return false; }
        const calculateStar = calculateEffects.star;
        const starProd = global.buildingsInfo.producing[4];
        const restProd = new Overlimit(starProd[1]).plus(starProd[3], starProd[4], starProd[5]);
        if (massBoost * new Overlimit(starProd[2]).multiply(calculateStar[0](true) / calculateStar[0]()).plus(restProd).divide(restProd.plus(starProd[2])).replaceNaN('1').toNumber() * (calculateStar[1](true) / calculateStar[1]()) * (calculateStar[2](true) / calculateStar[2]()) < collapse.input[0]) { return false; }
        collapseReset();
        return true;
    }
    return info.newMass > collapse.mass || (level < 2 && (info.starCheck[0] > 0 || info.starCheck[1] > 0 || info.starCheck[2] > 0)) || player.elements.includes(0.5, 1);
};
export const collapseResetUser = async() => {
    if (global.paused || !collapseResetCheck()) { return; }

    if (player.toggles.confirm[4] !== 'None') {
        let errorText = '';
        if (player.inflation.vacuum) {
            const unlockedG = player.researchesExtra[5][0] >= 1;
            const cantAffordG = !unlockedG || calculateBuildingsCost(3, 5).moreThan(global.collapseInfo.newMass);
            const timeUntil = new Overlimit(global.inflationInfo.massCap / 8.96499278339628e-67).minus(player.buildings[1][0].current).divide(global.buildingsInfo.producing[1][1]).toNumber();
            if (timeUntil > 0 && timeUntil < 1e6 && cantAffordG) {
                errorText += `Solar mass isn't hardcapped, but can be soon hardcapped${unlockedG ? ", also can't afford new Galaxy" : ''}`;
            }
            if (player.researchesExtra[2][1] <= 0 || player.vaporization.clouds.lessOrEqual('0')) {
                if (errorText !== '') { errorText += '\nAlso '; }
                errorText += `current ${player.researchesExtra[2][1] <= 0 ? "level for Cloud Research 'Rain Clouds'" : 'Cloud amount'} is 0, which could make recovering from Collapse really slow`;
            }
        }
        if (player.stage.active !== 4 && player.stage.active !== 5) {
            if (errorText !== '') { errorText += '\nAlso '; }
            errorText += "current active Stage isn't Interstellar";
        }
        if (errorText !== '') {
            if (!await Confirm(`Prevented Collapse because ${errorText}\nReset anyway?`)) { return; }
            if (!collapseResetCheck()) { return Notify('Collapse canceled, requirements are no longer met'); }
        }
    }

    if (globalSave.SRSettings[0]) {
        const { starCheck: newStars, newMass } = global.collapseInfo;
        let count = 0;
        for (let i = 1; i < playerStart.elements.length; i++) {
            i = player.elements.indexOf(0.5, i);
            if (i < 1) { break; }
            count++;
        }
        let message = `Caused Collapse to${count > 0 ? ` activate ${format(count)} new Elements and` : ''} ${newMass > player.collapse.mass ? `increase Solar mass to ${format(newMass)}` : ''}`;
        if (newStars[0] > 0 || newStars[1] > 0 || newStars[2] > 0) {
            message += newMass > player.collapse.mass ? ', also gained' : 'gain';
            if (newStars[0] > 0) { message += ` ${format(newStars[0])} Red giants`; }
            if (newStars[1] > 0) { message += `, ${format(newStars[1])} Neutron stars`; }
            if (newStars[2] > 0) { message += `, ${format(newStars[2])} Black holes`; }
        }
        getId('SRMain').textContent = message;
    }
    collapseReset();
    numbersUpdate();
};

const collapseReset = (noReset = false) => {
    const collapseInfo = global.collapseInfo;
    const collapse = player.collapse;

    collapse.stars[0] += collapseInfo.starCheck[0];
    collapse.stars[1] += collapseInfo.starCheck[1];
    collapse.stars[2] += collapseInfo.starCheck[2];
    if (!noReset) {
        if (collapseInfo.newMass > collapse.mass) {
            collapse.mass = collapseInfo.newMass;
            if (collapse.massMax < collapse.mass) { collapse.massMax = collapse.mass; }
        }
        for (let i = 1; i < playerStart.elements.length; i++) { //Must be below mass and star checks
            i = player.elements.indexOf(0.5, i);
            if (i < 1) { break; }
            buyUpgrades(i, 4, 'elements', true);
        }

        reset('collapse', player.inflation.vacuum ? [1, 2, 3, 4] : (player.strangeness[5][3] < 1 ? [4, 5] : [4]));
        calculateMaxLevel(0, 4, 'researches');
        calculateMaxLevel(1, 4, 'researches');
    }
    awardVoidReward(4);
};

export const assignMergeReward = () => {
    global.mergeInfo.checkReward[0] = Math.max(Math.floor(player.buildings[5][3].true / 40), 0);
};
export const calculateMergeMaxResets = (): number => {
    let max = 1;
    if (player.elements[30] >= 1) { max += player.buildings[6][1].true; }
    return max;
};

const mergeResetCheck = (): boolean => {
    if (player.upgrades[5][3] !== 1) { return false; }
    if (!player.inflation.vacuum) { return player.buildings[5][3].true >= 22 + 2 * player.buildings[6][1].true; }
    if (player.merge.resets >= calculateMergeMaxResets() || player.buildings[5][3].true < 1) { return false; }
    assignMergeReward();

    return true;
};
export const mergeResetUser = async() => {
    if (global.paused || !mergeResetCheck()) { return; }

    if (player.toggles.confirm[5] !== 'None') {
        if (player.stage.active !== 5) {
            if (!await Confirm("Prevented Merge because current active Stage isn't Intergalactic\nReset anyway?")) { return; }
            if (!mergeResetCheck()) { return Notify('Merge canceled, requirements are no longer met'); }
        }
    }

    mergeReset();
    numbersUpdate();
    if (globalSave.SRSettings[0]) {
        const { checkReward } = global.mergeInfo;
        getId('SRMain').textContent = player.inflation.vacuum ? `Tryed to Merge Galaxies and ${checkReward[0] > 0 ? `created ${format(checkReward[0])} Galaxy Groups` : 'resetted self-made Galaxies'}` : 'Vacuum decayed into its true state';
    }
};

const mergeReset = () => {
    if (!player.inflation.vacuum) { return switchVacuum(); }
    player.merge.resets++;
    player.buildings[5][3].true = 0;
    player.merge.reward[0] += global.mergeInfo.checkReward[0];
    reset('galaxy', [1, 2, 3, 4, 5]);
    calculateMaxLevel(0, 4, 'researches');
    calculateMaxLevel(1, 4, 'researches');
    calculateMaxLevel(2, 4, 'researches');

    if (player.stage.current < 6) {
        player.stage.current = 6;
        stageUpdate(false, true);
    }
};

export const assignMilestoneInformation = (index: number, stageIndex: number) => {
    const pointer = global.milestonesInfo[stageIndex];
    const level = player.milestones[stageIndex][index];
    if (player.inflation.vacuum) {
        pointer.time[index] = 1200;
        pointer.need[index].setValue('Infinity');
    } else {
        const percentage = level / (pointer.max[index] - 1);
        if (stageIndex === 1) {
            pointer.time[index] = 14400 / (percentage * (index === 1 ? 11 : 3) + 1) ** percentage;
        } else if (stageIndex === 2) {
            pointer.time[index] = 28800 / (percentage * (index === 1 ? 23 : 7) + 1) ** percentage;
        } else if (stageIndex === 3) {
            pointer.time[index] = 43200 / (percentage * (index === 1 ? 35 : 11) + 1) ** percentage;
        } else if (stageIndex === 4) {
            pointer.time[index] = 57600 / (percentage * (index === 1 ? 47 : 15) + 1) ** percentage;
        } else if (stageIndex === 5) {
            pointer.time[index] = index === 0 ? (3600 / (percentage * 2 + 1)) : 1200;
        }
        pointer.need[index].setValue(pointer.scaling[index][level]);
    }
    if (player.inflation.tree[0] === 1) { pointer.time[index] /= 4; }
};

const awardMilestone = (index: number, stageIndex: number, count = 0) => {
    if (!milestoneCheck(index, stageIndex)) {
        if (count > 0) {
            player.strange[0].current += count;
            player.strange[0].total += count;
            assignStrangeInfo[0]();

            Notify(`Milestone '${global.milestonesInfo[stageIndex].name[index]}' new tier completed${!player.inflation.vacuum && player.milestones[stageIndex][index] >= global.milestonesInfo[stageIndex].max[index] ? ', maxed' : ''}`);
            if (!player.inflation.vacuum) {
                if (stageIndex === 4) {
                    if (index === 0 && player.milestones[4][0] >= 8) { calculateMaxLevel(6, 4, 'strangeness', true); }
                } else if (stageIndex === 5) {
                    if (index === 0 && player.milestones[5][0] >= 8) { calculateMaxLevel(6, 5, 'strangeness', true); }
                }
            } else if (stageIndex === 3 && index === 1) {
                global.accretionInfo.effective = calculateEffects.effectiveRank();
                calculateMaxLevel(0, 3, 'researchesExtra', true);
            }
        }
        return;
    }

    player.milestones[stageIndex][index]++;
    assignMilestoneInformation(index, stageIndex);
    awardMilestone(index, stageIndex, count + 1);
};

/** Also updates related information */
export const toggleSuperVoid = (change = false) => {
    const info = global.challengesInfo;
    if (change) {
        if (player.challenges.active === 0) { return Notify(`Can't be toggled while inside ${info.name[0]}`); }
        player.challenges.super = !player.challenges.super && player.stage.true >= 7;
    }

    const toggleHTML = getId('superVoidToggle');
    if (player.challenges.super) {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = 'ON';
        info.name[0] = 'Super Void';
        info.rewardText[0] = global.voidRewards[1];
        info.reset[0] = 'vacuum';
        getId('voidRewardsExtraText').textContent = 'All rewards are active only while inside any Void\nAnd related Void rewards will persist through Vacuum reset';
    } else {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = 'OFF';
        info.name[0] = 'Void';
        info.rewardText[0] = global.voidRewards[0];
        info.reset[0] = 'stage';
        getId('voidRewardsExtraText').textContent = 'All rewards are related to Strangeness';
    }
    assignChallengeInformation();
    if (change) { numbersUpdate(); }
};

/* For now just index 0 */
export const assignChallengeInformation = () => {
    global.challengesInfo.time[0] = player.challenges.super ? 1200 : 3600;
    if (player.inflation.tree[0] === 1) { global.challengesInfo.time[0] /= 4; }
};

const awardVoidReward = (index: number) => {
    if (player.challenges.active !== 0) { return; }

    let progress = 1;
    if (index === 1) {
        progress += player.researchesExtra[1][2];
    } else if (index === 2) {
        if (player.vaporization.clouds.moreThan('1e4')) { progress += player.accretion.rank > 1 ? 1 : 2; }
    } else if (index === 3) {
        progress = Math.min(player.accretion.rank - 1, 6);
    } else if (index === 4) {
        if (player.collapse.stars[0] >= 1) { progress++; }
        if (player.collapse.stars[1] >= 1) { progress++; }
        if (player.collapse.stars[2] >= 1) { progress++; }
    } else if (index === 5) {
        if (player.buildings[5][3].true >= 1) { progress++; }
        if (player.merge.reward[0] >= 1) { progress++; }
    }

    const superVoid = player.challenges.super;
    const old = player.challenges[superVoid ? 'superVoid' : 'void'][index];
    if (old >= progress || player.time[superVoid ? 'universe' : 'stage'] > global.challengesInfo.time[0]) { return; }

    player.challenges.void[index] = progress;
    if (player.challenges.voidCheck[index] < progress) { player.challenges.voidCheck[index] = progress; }
    if (superVoid) {
        player.challenges.superVoid[index] = progress;
        if (player.clone.challenges?.void[index] < progress) { player.clone.challenges.void[index] = progress; }
    }
    for (let i = old; i < progress; i++) {
        Notify(`New ${superVoid ? 'Super ' : ''}Void reward achieved\nReward: ${global.challengesInfo.rewardText[0][index][i]}`);
    }
    if (index === 3) {
        if (old < 4) {
            calculateMaxLevel(0, 1, 'strangeness', true);
            calculateMaxLevel(3, 1, 'strangeness', true);
            calculateMaxLevel(1, 2, 'strangeness', true);
            calculateMaxLevel(3, 2, 'strangeness', true);
            calculateMaxLevel(0, 3, 'strangeness', true);
            calculateMaxLevel(1, 3, 'strangeness', true);
            calculateMaxLevel(0, 4, 'strangeness', true);
            calculateMaxLevel(1, 4, 'strangeness', true);
            calculateMaxLevel(2, 5, 'strangeness', true);
        }
    } else if (index === 4) {
        if (old < 1) {
            calculateMaxLevel(4, 1, 'strangeness', true);
            calculateMaxLevel(4, 2, 'strangeness', true);
            calculateMaxLevel(4, 3, 'strangeness', true);
            calculateMaxLevel(4, 4, 'strangeness', true);
        }
    }
};

/** Null means exit if possible, nothing if isn't. Entering same challenge will exit out of it */
export const enterExitChallengeUser = (index: number | null) => {
    if (global.paused) { return; }
    const old = player.challenges.active;
    if (old === index || index === null) {
        if (old === null) { return; }
        player.challenges.active = null;

        challengeReset(null, old);
        Notify(`Left the '${global.challengesInfo.name[old]}'`);
    } else {
        if (index === 0 && !player.challenges.super && !player.inflation.vacuum) { return; }
        player.challenges.active = index;

        challengeReset(index, old);
        Notify(`'${global.challengesInfo.name[index]}' is now active`);
    }
};
const exitChallengeAuto = () => {
    const old = player.challenges.active;
    if (old === null) { return; }
    const info = global.challengesInfo;
    if (player.time[info.reset[old] === 'vacuum' ? 'universe' : 'stage'] <= info.time[old]) { return; }

    player.challenges.active = null;
    challengeReset(null, old);
    Notify(`Automatically left the '${info.name[old]}'`);
};
/** Handles all required resets related to challenges */
const challengeReset = (next: number | null, old: number | null) => {
    if (next !== null) {
        const resetType = global.challengesInfo.reset;
        if (old !== null) { challengeReset(null, old); }
        cloneBeforeReset(resetType[next]);
        if (resetType[next] === 'vacuum') {
            if (player.stage.active < 6) { setActiveStage(1); }
            player.time.export[0] = 0;
            player.inflation.age = 0;
            player.time.universe = 0;
            if (!player.inflation.vacuum) {
                player.clone.inflation.vacuum = false;
                player.inflation.vacuum = true;
                prepareVacuum(true);
                visualTrueStageUnlocks();
            }
            resetVacuum();
        } else {
            stageFullReset();
            if (next === 0) { assignTrueEnergy(); }
        }
    } else if (old !== null) {
        if (player.stage.active < 6) { setActiveStage(1); }
        if (player.clone.inflation?.vacuum === false) {
            player.inflation.vacuum = false;
            prepareVacuum(false);
            visualTrueStageUnlocks();
        }
        loadFromClone();
    }
};
