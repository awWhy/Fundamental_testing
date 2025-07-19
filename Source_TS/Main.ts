import { player, global, playerStart, updatePlayer, deepClone } from './Player';
import { getUpgradeDescription, switchTab, numbersUpdate, visualUpdate, format, getChallengeDescription, getChallenge0Reward, getChallenge1Reward, stageUpdate, getStrangenessDescription, addIntoLog, updateCollapsePoints } from './Update';
import { assignBuildingsProduction, autoElementsSet, autoResearchesSet, autoUpgradesSet, buyBuilding, buyStrangeness, buyUpgrades, buyVerse, calculateEffects, collapseResetUser, dischargeResetUser, endResetUser, enterExitChallengeUser, inflationRefund, loadoutsLoadAuto, mergeResetUser, nucleationResetUser, rankResetUser, setActiveStage, stageResetUser, switchStage, timeUpdate, toggleConfirm, toggleSupervoid, toggleSwap, vaporizationResetUser } from './Stage';
import { Alert, Prompt, setTheme, changeFontSize, changeFormat, specialHTML, replayEvent, Confirm, preventImageUnload, Notify, MDStrangenessPage, globalSave, toggleSpecial, saveGlobalSettings, openHotkeys, openVersionInfo, openLog, errorNotify } from './Special';
import { assignHotkeys, detectHotkey, detectShift, handleTouchHotkeys } from './Hotkeys';
import { prepareVacuum } from './Vacuum';
import { checkUpgrade } from './Check';
import type { hotkeysList } from './Types';

/** Only for static HTML, by default (false) throws error if id is null */
export const getId = (id: string, noError = false): HTMLElement => {
    const test = specialHTML.cache.idMap.get(id);
    if (test !== undefined) { return test; }

    const store = document.getElementById(id);
    if (store !== null) {
        specialHTML.cache.idMap.set(id, store);
        return store;
    }

    if (noError) { return null as unknown as HTMLElement; }
    errorNotify(`Error encountered, ID ‒ '${id}' doesn't exist`);
    throw new ReferenceError(`ID ‒ '${id}' doesn't exist`);
};

/** Only for static HTML, by default (false) throws error if query isn't found is null */
export const getQuery = (query: string, noError = false): HTMLElement => {
    const test = specialHTML.cache.queryMap.get(query);
    if (test !== undefined) { return test; }

    const store = document.querySelector(query) as HTMLElement; //Can't add null type due to eslint being buggy
    if (store !== null) {
        specialHTML.cache.queryMap.set(query, store);
        return store;
    }

    if (noError) { return null as unknown as HTMLElement; }
    errorNotify(`Error encountered, Query ‒ '${query}' failed to find anything`);
    throw new ReferenceError(`Query ‒ '${query}' failed to find anything`);
};

/** Id collection will be auto updated by browser */
export const getClass = (idCollection: string): HTMLCollectionOf<HTMLElement> => {
    const test = specialHTML.cache.classMap.get(idCollection);
    if (test !== undefined) { return test; }
    const store = document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>;
    specialHTML.cache.classMap.set(idCollection, store);
    return store;
};

/** Returns offline time in milliseconds */
const handleOfflineTime = (): number => {
    const timeNow = Date.now();
    const offlineTime = timeNow - player.time.updated;
    player.time.updated = timeNow;
    player.time.export[0] += offlineTime * calculateEffects.T0Inflation5();
    return offlineTime;
};
export const simulateOffline = async(offline: number) => {
    const info = global.offline;
    if (!info.active) { pauseGame(); }
    offline += player.time.offline;
    player.time.offline = 0;

    let decline = false;
    if (offline >= 20 && !player.toggles.normal[4]) {
        decline = !await Confirm(`Claim ${format(Math.min(offline / 1000, 43200), { type: 'time', padding: false })} worth of Offline time?\n(Includes time spent to click any of the buttons)`, 2) &&
            (globalSave.developerMode || !await Confirm("Press 'Cancel' again to confirm losing Offline time, 'Confirm' to keep it"));
        const extra = handleOfflineTime();
        global.lastSave += extra;
        offline += extra;
    }
    if (decline || offline < 20) {
        if (offline < 0) { player.time.offline = offline - 20; }
        timeUpdate(20, 20); //Just in case
        pauseGame(false);
        visualUpdate();
        numbersUpdate();
        return;
    } else if (offline > 43200_000) { offline = 43200_000; }
    let tick = globalSave.intervals.offline;
    const startValue = offline;
    const startStage = player.stage.active;
    info.stage[0] = null;
    info.stage[1] = null;
    player.time.online += offline;

    const body = document.body;
    const mainHTML = getId('offlineMain');
    const accelBtn = getId('offlineAccelerate');
    const deaccelBtn = getId('offlineDeaccelerate');
    const cancelBtn = getId('offlineCancel');
    const oldFocus = document.activeElement as HTMLElement | null;
    const accelerate = () => { tick *= 2; };
    const deaccelerate = () => { tick = Math.max(tick / 2, 20); };
    const finish = () => { tick = 0; };
    const key = (event: KeyboardEvent) => {
        const shift = detectShift(event);
        if (shift === null) { return; }
        const code = event.code;
        if (code === 'Escape') {
            if (shift) { return; }
            finish();
            event.preventDefault();
        } else if (code === 'Tab') {
            if (shift && document.activeElement === accelBtn) {
                cancelBtn.focus();
            } else if (!shift && document.activeElement === cancelBtn) {
                accelBtn.focus();
            } else { return; }
            event.preventDefault();
        }
    };
    const end = () => {
        pauseGame(false);
        if (info.stage[0] !== null) {
            player.stage.active = startStage;
            setActiveStage(info.stage[0]);
        }
        if (info.stage[1] !== null) {
            stageUpdate(info.stage[1]);
        } else {
            visualUpdate();
            numbersUpdate();
        }
        mainHTML.style.display = 'none';
        accelBtn.removeEventListener('click', accelerate);
        deaccelBtn.removeEventListener('click', deaccelerate);
        cancelBtn.removeEventListener('click', finish);
        body.removeEventListener('keydown', key);
        oldFocus?.focus();
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Offline calculation ended'; }
    };
    accelBtn.addEventListener('click', accelerate);
    deaccelBtn.addEventListener('click', deaccelerate);
    cancelBtn.addEventListener('click', finish);
    body.addEventListener('keydown', key);
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Offline calculation started'; }
    mainHTML.style.display = '';
    accelBtn.focus();

    const tickHTML = getId('offlineTick');
    const remainsHTML = getId('offlineRemains');
    const percentageHTML = getQuery('#offlinePercentage > span');
    const calculate = () => {
        const time = tick <= 0 ? offline : Math.min(600 * tick, offline);
        offline -= time;
        try {
            timeUpdate(Math.max(time / 600, 20), time);
        } catch (error) {
            end();
            const stack = (error as { stack: string }).stack;
            void Alert(`Offline calculation failed due to error:\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`, 1);
            throw error;
        }
        if (offline >= 20) {
            setTimeout(calculate);
            tickHTML.textContent = format(tick);
            remainsHTML.textContent = format(offline / 1000, { type: 'time' });
            percentageHTML.textContent = format(100 - offline / startValue * 100, { padding: true });
        } else {
            player.time.offline += offline;
            end();
        }
    };
    calculate();
};

const changeIntervals = () => {
    const intervalsId = global.intervalsId;
    const intervals = globalSave.intervals;
    const paused = global.offline.active || global.paused;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    intervalsId.main = paused ? undefined : setInterval(timeUpdate, 20, 20);
    intervalsId.numbers = paused ? undefined : setInterval(numbersUpdate, intervals.numbers);
    intervalsId.visual = paused ? undefined : setInterval(visualUpdate, intervals.visual);
    intervalsId.autoSave = paused ? undefined : setInterval(saveGame, intervals.autoSave);
};
/** Pauses and unpauses game based on 'pause' value */
export const pauseGame = (pause = true) => {
    if (!pause && global.paused) {
        const button = getId('pauseButton');
        button.style.borderColor = '';
        button.style.color = '';
        getId('gamePaused').style.display = 'none';
        global.paused = false;
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Game unpaused'; }
    }
    global.hotkeys.disabled = pause;
    global.offline.active = pause;
    changeIntervals();

    if (!pause && global.offline.cacheUpdate) {
        global.offline.cacheUpdate = false;
        preventImageUnload();
    }
};
export const pauseGameUser = () => {
    if (global.offline.active) { return; }
    if (!global.paused) {
        const button = getId('pauseButton');
        button.style.borderColor = 'forestgreen';
        button.style.color = 'var(--green-text)';
        getId('gamePaused').style.display = '';
        global.paused = true;
        changeIntervals();
        if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Game paused'; }
        return;
    }
    const offline = handleOfflineTime();
    global.lastSave += offline;
    void simulateOffline(offline);
};

const saveGame = (noSaving = false): string | null => {
    if (global.offline.active) { return null; }
    try {
        player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);
        player.history.end.list = global.historyStorage.end.slice(0, player.history.end.input[0]);

        const clone = { ...player };
        clone.fileName = String.fromCharCode(...new TextEncoder().encode(clone.fileName));
        clone.inflation = deepClone(clone.inflation);
        for (let i = 0; i < clone.inflation.loadouts.length; i++) {
            clone.inflation.loadouts[i][0] = String.fromCharCode(...new TextEncoder().encode(clone.inflation.loadouts[i][0]));
        }
        const save = btoa(JSON.stringify(clone));
        if (!noSaving) {
            localStorage.setItem(specialHTML.localStorage.main, save);
            clearInterval(global.intervalsId.autoSave);
            if (!global.paused) { global.intervalsId.autoSave = setInterval(saveGame, globalSave.intervals.autoSave); }
            getId('isSaved').textContent = 'Saved';
            global.lastSave = 0;
        }
        return save;
    } catch (error) {
        const stack = (error as { stack: string }).stack;
        void Alert(`Failed to save the game\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`, 1);
        throw error;
    }
};
const loadGame = (save: string) => {
    if (global.offline.active) { return; }
    pauseGame();
    try {
        const versionCheck = updatePlayer(JSON.parse(atob(save)));

        global.lastSave = handleOfflineTime();
        Notify(`This save is ${format(global.lastSave / 1000, { type: 'time', padding: false })} old${versionCheck !== player.version ? `\nSave file version is ${versionCheck}` : ''}`);
        stageUpdate(true, true);

        void simulateOffline(global.lastSave);
    } catch (error) {
        prepareVacuum(Boolean(player.inflation.vacuum)); //Fix vacuum state
        pauseGame(false);

        void Alert(`Incorrect save file format\n${error}`);
        throw error;
    }
};

const replaceSaveFileSpecials = (name = player.fileName): string => {
    const date = new Date();
    const dateIndex = name.indexOf('[date');
    if (dateIndex >= 0) {
        const endIndex = name.indexOf(']', dateIndex + 5);
        if (endIndex >= 0) {
            let replaced = name.substring(dateIndex + 5, endIndex);
            const special = [
                'Y',
                'M',
                'D'
            ];
            const replaceWith = [
                `${date.getFullYear()}`,
                `${date.getMonth() + 1}`.padStart(2, '0'),
                `${date.getDate()}`.padStart(2, '0')
            ];
            for (let i = 0; i < special.length; i++) {
                replaced = replaced.replace(special[i], replaceWith[i]);
            }
            name = name.replace(name.substring(dateIndex, endIndex + 1), replaced);
        }
    }
    const timeIndex = name.indexOf('[time');
    if (timeIndex >= 0) {
        const endIndex = name.indexOf(']', timeIndex + 5);
        if (endIndex >= 0) {
            let replaced = name.substring(timeIndex + 5, endIndex);
            const special = [
                'H',
                'M',
                'S'
            ];
            const replaceWith = [
                `${date.getHours()}`.padStart(2, '0'),
                `${date.getMinutes()}`.padStart(2, '0'),
                `${date.getSeconds()}`.padStart(2, '0')
            ];
            for (let i = 0; i < special.length; i++) {
                replaced = replaced.replace(special[i], replaceWith[i]);
            }
            name = name.replace(name.substring(timeIndex, endIndex + 1), replaced);
        }
    }

    const special = [
        '[version]',
        '[stage]',
        '[strange]',
        '[inflaton]',
        '[cosmon]',
        '[vacuum]',
        '[galaxy]',
        '[universe]'
    ];
    const replaceWith = [
        player.version,
        global.stageInfo.word[player.stage.current],
        format(player.strange[0].total, { type: 'input', padding: true }),
        format(player.cosmon[0].total, { type: 'input', padding: 'exponent' }),
        format(player.cosmon[1].total, { type: 'input', padding: 'exponent' }),
        `${player.inflation.vacuum}`,
        format(player.buildings[5][3].current, { type: 'input', padding: 'exponent' }),
        format(player.verses[0].current, { type: 'input', padding: 'exponent' })
    ];
    for (let i = 0; i < special.length; i++) {
        name = name.replace(special[i], replaceWith[i]);
    }
    return `${name}.txt`;
};

const repeatFunction = (repeat: () => any) => {
    if (global.intervalsId.mouseRepeat !== undefined) { return; }
    global.intervalsId.mouseRepeat = setTimeout(() => {
        global.intervalsId.mouseRepeat = setInterval(repeat, 50);
    }, 200);
};
const cancelRepeat = () => {
    clearInterval(global.intervalsId.mouseRepeat);
    global.intervalsId.mouseRepeat = undefined;
};

/** Prevents element from going offscreen, for now only works for centered labels */
const showAndFix = (element: HTMLElement) => {
    element.style.right = '';
    element.style.display = '';
    const rect = element.getBoundingClientRect();
    if (rect.left < 0) {
        element.style.right = `calc(50% - ${-rect.left}px)`;
    } else {
        const width = document.documentElement.clientWidth;
        if (rect.right > width) { element.style.right = `calc(50% + ${rect.right - width}px)`; }
    }
};

const hoverUpgrades = (index: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements') => {
    if (type === 'elements') {
        global.lastElement = index;
    } else { global.lastUpgrade[player.stage.active] = [index, type]; }
    getUpgradeDescription(index, type);
};
const hoverStrangeness = (index: number, stageIndex: number, type: 'strangeness' | 'milestones' | 'inflations') => {
    if (type === 'inflations') {
        global.lastInflation = [index, stageIndex];
    } else if (type === 'strangeness') {
        global.lastStrangeness = [index, stageIndex];
    } else { global.lastMilestone = [index, stageIndex]; }
    getStrangenessDescription(index, stageIndex, type);
};
const hoverChallenge = (index: number) => {
    global.lastChallenge[0] = index;
    getChallengeDescription(index);
    if (index === 0) {
        getChallenge0Reward(global.lastChallenge[1]);
    } else if (index === 1) {
        getChallenge1Reward();
    }
    visualUpdate();
};
export const changeRewardType = (state = !global.sessionToggles[0]) => {
    global.sessionToggles[0] = state;
    getId('rewardsType').textContent = `${state ? 'Supervoid' : 'Void'} rewards:`;
};
/** Creates X automatization Research or switches Stage to from which that Research auto can be created if done from wrong Stage */
const handleAutoResearchCreation = (index: number) => {
    if (player.researchesAuto[index] >= global.researchesAutoInfo.max[index]) { return; }
    const stageIndex = player.stage.active;
    if (checkUpgrade(index, stageIndex, 'researchesAuto')) {
        buyUpgrades(index, stageIndex, 'researchesAuto');
        return;
    }

    const autoStage = global.researchesAutoInfo.autoStage[index][player.researchesAuto[index]];
    global.lastUpgrade[autoStage][0] = index;
    global.lastUpgrade[autoStage][1] = 'researchesAuto';
    switchStage(autoStage, stageIndex);
};

export const buyAll = () => {
    const active = player.stage.active;
    const max = global.buildingsInfo.maxActive[active];
    if (active === 3) {
        for (let i = 1; i < max; i++) { buyBuilding(i, active, 0); }
    } else {
        for (let i = max - 1; i >= 1; i--) { buyBuilding(i, active, 0); }
    }
    if (active === 6) {
        for (let i = 0; i < playerStart.verses.length; i++) { buyVerse(i); }
    }
};

export const loadoutsVisual = (loadout: number[]) => {
    if (getId('loadoutsMain').style.display === 'none') { return; }
    const appeared = {} as Record<number, number>;
    const { firstCost, scaling } = global.treeInfo[0];
    const calculate = (index: number) => Math.floor(Math.round((firstCost[index] + scaling[index] * appeared[index]) * 100) / 100);

    let cost = 0;
    let string = '';
    for (let i = 0, dupes = 1; i < loadout.length; i += dupes, dupes = 1) {
        const current = loadout[i];
        appeared[current] = appeared[current] === undefined ? 0 : appeared[current] + 1;
        cost += calculate(current);
        while (loadout[i + dupes] === current) {
            appeared[current]++;
            cost += calculate(current);
            dupes++;
        }
        string += `${i > 0 ? ', ' : ''}${current + 1}${dupes > 1 ? `x${dupes}` : ''}`;
    }
    getQuery('#loadoutsEditLabel > span').textContent = format(cost, { padding: 'exponent' });
    (getId('loadoutsEdit') as HTMLInputElement).value = string;
};
export const loadoutsRecreate = () => {
    const old = global.loadouts.buttons;
    for (let i = 0; i < old.length; i++) { old[i][0].removeEventListener('click', old[i][1]); }
    const newOld: typeof old = [];
    const listHTML = getQuery('#loadoutsList > span');
    listHTML.textContent = '';
    for (let i = 0; i < player.inflation.loadouts.length; i++) {
        const button = document.createElement('button');
        button.textContent = player.inflation.loadouts[i][0];
        button.className = 'selectBtn redText';
        button.type = 'button';
        const event = () => {
            if (global.hotkeys.shift) { return void loadoutsLoad(i); }
            (getId('loadoutsName') as HTMLInputElement).value = player.inflation.loadouts[i][0];
            loadoutsVisual((global.loadouts.input = player.inflation.loadouts[i][1]));
        };
        newOld[i] = [button, event];
        listHTML.append(button, ', ');
        button.addEventListener('click', event);
    }
    global.loadouts.buttons = newOld;
};
const loadoutsSave = () => {
    const name = (getId('loadoutsName') as HTMLInputElement).value;
    if (name.length < 1 || name === 'Auto-generate') { return Notify(`Loadout name: '${name}' is not allowed`); }
    const loadouts = player.inflation.loadouts;
    let index = loadouts.length;
    for (let i = 0; i < index; i++) {
        if (name === loadouts[i][0]) {
            index = i;
            break;
        }
    }
    loadouts[index] = [name, global.loadouts.input];
    loadoutsRecreate();
    Notify(`Saved loadout as '${name}'`);
};
const loadoutsLoad = async(loadout = null as null | number) => {
    if (global.offline.active || !await inflationRefund(loadout !== null || global.hotkeys.shift, true)) { return; }

    const array = loadout !== null ? player.inflation.loadouts[loadout][1] : global.loadouts.input;
    for (let i = 0; i < array.length; i++) {
        if (!checkUpgrade(array[i], 0, 'inflations')) { continue; }
        buyStrangeness(array[i], 0, 'inflations', true);
    }
    if ((getId('loadoutsName') as HTMLInputElement).value === 'Auto-generate') { loadoutsLoadAuto(); }
    numbersUpdate();
    if (globalSave.SRSettings[0]) { getId('SRMain').textContent = 'Loaded loadout'; }
};

export const globalSaveStart = deepClone(globalSave);
try { //Start everything
    const globalSettings = localStorage.getItem(specialHTML.localStorage.settings);
    if (globalSettings !== null) {
        try {
            Object.assign(globalSave, JSON.parse(atob(globalSettings)));
            const decoder = new TextDecoder();
            for (const key in globalSave.hotkeys) { //Restore decoded data
                const array = globalSave.hotkeys[key as hotkeysList];
                for (let i = 0; i < array.length; i++) {
                    array[i] = decoder.decode(Uint8Array.from(array[i], (c) => c.codePointAt(0) as number));
                }
            }
            if (!(globalSave.intervals.offline >= 20)) { globalSave.intervals.offline = 20; } //Fix NaN and undefined
            for (let i = globalSave.toggles.length; i < globalSaveStart.toggles.length; i++) {
                globalSave.toggles[i] = false;
            }
            for (let i = globalSave.MDSettings.length; i < globalSaveStart.MDSettings.length; i++) {
                globalSave.MDSettings[i] = false;
            }
            for (let i = globalSave.SRSettings.length; i < globalSaveStart.SRSettings.length; i++) {
                globalSave.SRSettings[i] = false;
            }
            for (const key in globalSaveStart.hotkeys) {
                globalSave.hotkeys[key as hotkeysList] ??= ['None', 'None'];
            }
        } catch (error) {
            Notify('Global settings failed to parse, default ones will be used instead');
            console.log(`(Full parse error) ${error}`);
        }
    }
    (getId('decimalPoint') as HTMLInputElement).value = globalSave.format[0];
    (getId('thousandSeparator') as HTMLInputElement).value = globalSave.format[1];
    (getId('offlineInterval') as HTMLInputElement).value = `${globalSave.intervals.offline}`;
    (getId('numbersInterval') as HTMLInputElement).value = `${globalSave.intervals.numbers}`;
    (getId('visualInterval') as HTMLInputElement).value = `${globalSave.intervals.visual}`;
    (getId('autoSaveInterval') as HTMLInputElement).value = `${globalSave.intervals.autoSave / 1000}`;
    for (let i = 0; i < globalSaveStart.toggles.length; i++) { toggleSpecial(i, 'global'); }
    if (globalSave.fontSize !== 16) { changeFontSize(true); } //Also sets breakpoints for screen size
    if (globalSave.toggles[4]) { getId('globalStats').style.display = 'none'; }
    if (globalSave.toggles[3]) {
        getQuery('#footer > div:first-child').style.display = 'none';
        const fake2 = document.createElement('div');
        fake2.style.height = 'max(calc(6.08em + 32px), 7.92em)';
        getId('body').prepend(getId('footer'), fake2);
        getId('fakeFooter').after(getId('shortcuts'));
        const div = document.createElement('div');
        div.append(getId('footerStats'), getQuery('#footerMain > nav'), getId('stageSelect'));
        getId('footerMain').append(div, getId('subtabs'));
        specialHTML.styleSheet.textContent += `.insideTab { margin-top: 0.6rem; }
            #footer { top: 0; bottom: unset; }
            #footerMain { flex-direction: row; padding: 0.6em 0; gap: 0.6em; }
            #footerMain > div { display: flex; flex-direction: column; row-gap: 0.6em; margin: 0 0 0 auto; }
            #footerMain > div > nav { display: flex; flex-flow: row nowrap; justify-content: center; column-gap: 0.4em; }
            #footerStats { justify-content: center; column-gap: 0.6em; margin: 0; }
            #stageSelect { position: unset; margin: 0; max-width: unset; }
            #subtabs { flex-flow: column-reverse wrap; gap: 0.6em !important; align-self: end; margin: 0 auto 0 0 !important; max-height: 6.72em; width: 0; /* min-width: 7em; */ }
            #footerMain button, #shortcuts button { width: min-content; min-width: 4em; height: 2em; border-radius: 10px; font-size: 0.92em; }
            #subtabs button { width: 100%; min-width: 7em; }
            #globalStats { bottom: 3.04em; right: calc(50vw - 6.325em); }
            #shortcuts { flex-direction: row-reverse; gap: 0.4em; justify-content: center; position: fixed; width: 100vw; max-width: unset; bottom: 0.6em; margin: 0; }
            #fakeFooter { height: 3.04em; } `;
    }
    if (globalSave.toggles[2]) { document.body.classList.remove('noTextSelection'); }
    if (globalSave.toggles[1]) {
        const elementsArea = getId('upgradeSubtabElements');
        elementsArea.id = 'ElementsTab';
        getId('upgradeTab').after(elementsArea);

        const elementsButton = getId('upgradeSubtabBtnElements');
        elementsButton.id = 'ElementsTabBtn';
        elementsButton.classList.add('stage4Include');
        getId('upgradeTabBtn').after(elementsButton);

        global.tabs.Elements = {
            current: 'Elements',
            list: []
        };
        global.tabs.upgrade.list.splice(global.tabs.upgrade.list.indexOf('Elements'), 1);
        global.tabs.list.splice(global.tabs.list.indexOf('upgrade') + 1, 0, 'Elements');
    }

    if (globalSave.MDSettings[0]) {
        toggleSpecial(0, 'mobile');
        (document.getElementById('MDMessage1') as HTMLElement).remove();
        specialHTML.styleSheet.textContent += `body.noTextSelection, img, input[type = "image"], button, #load, a, #notifications > p, #globalStats { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; } /* Safari junk to disable image hold menu and text selection */
            #themeArea > div > div { position: unset; display: flex; width: 15em; }
            #themeArea > div > button { display: none; } /* More Safari junk to make windows work without focus */`;
        (getId('file') as HTMLInputElement).accept = ''; //Accept for unknown reason not properly supported on phones
        global.debug.MDStrangePage = 1;

        for (let i = 0; i <= 2; i++) {
            const arrow = document.createElement('button');
            arrow.innerHTML = '<span class="downArrow"></span>';
            arrow.type = 'button';
            getId(`reset${i}Main`).append(arrow);
            arrow.addEventListener('click', () => getId(`reset${i}Main`).classList.toggle('open'));
            arrow.addEventListener('blur', () => getId(`reset${i}Main`).classList.remove('open'));
        }
        specialHTML.styleSheet.textContent += `#resets { row-gap: 1em; }
            #resets > section { position: relative; flex-direction: row; justify-content: center; width: unset; padding: unset; row-gap: unset; background-color: unset; border: unset; }
            #resets > section:not(.open) > p { display: none !important; }
            #resets > section > button:last-of-type { display: flex; justify-content: center; align-items: center; width: 2.2em; margin-left: -2px; }
            #resets .downArrow { width: 1.24em; height: 1.24em; }
            #resets p { position: absolute; width: 17.4em; padding: 0.5em 0.6em 0.6em; background-color: var(--window-color); border: 2px solid var(--window-border); top: calc(100% - 2px); z-index: 2; box-sizing: content-box; } `;

        const createUpgButton = document.createElement('button');
        createUpgButton.className = 'hollowButton';
        createUpgButton.textContent = 'Create';
        createUpgButton.id = 'upgradeCreate';
        createUpgButton.type = 'button';
        getId('toggleHover0').after(createUpgButton);

        const createInfButton = document.createElement('button');
        createInfButton.className = 'hollowButton';
        createInfButton.textContent = 'Activate';
        createInfButton.id = 'inflationActivate';
        createInfButton.type = 'button';
        getId('inflationRefund').before(createInfButton);

        const pages = document.createElement('div');
        pages.id = 'strangenessPages';
        pages.innerHTML = '<button type="button" id="strangenessPage1" class="stage1borderImage hollowButton">1</button><button type="button" id="strangenessPage2" class="stage2borderImage hollowButton">2</button><button type="button" id="strangenessPage3" class="stage3borderImage hollowButton">3</button><button type="button" id="strangenessPage4" class="stage4borderImage hollowButton">4</button><button type="button" id="strangenessPage5" class="stage5borderImage hollowButton">5</button><button type="button" id="strangenessPage6" class="stage6borderImage hollowButton">6</button><button type="button" id="strangenessCreate" class="hollowButton">Create</button>';
        specialHTML.styleSheet.textContent += `#strangenessPages { display: flex; justify-content: center; column-gap: 0.36em; }
            #strangenessPages button { width: 2.08em; height: calc(2.08em - 2px); border-top: none; border-radius: 0 0 4px 4px; }
            #strangenessCreate { width: unset !important; padding: 0 0.4em; } `;
        getId('strangenessResearch').append(pages);

        const mainLi = getId('MDLi');
        const MDToggle1 = document.createElement('li');
        MDToggle1.innerHTML = '<label>Keep mouse events<button type="button" id="MDToggle1" class="specialToggle">OFF</button></label>';
        const MDToggle2 = document.createElement('li');
        MDToggle2.innerHTML = '<label>Allow zoom<button type="button" id="MDToggle2" class="specialToggle">OFF</button></label>';
        mainLi.after(MDToggle1, MDToggle2);
        for (let i = 1; i < globalSaveStart.MDSettings.length; i++) {
            getId(`MDToggle${i}`).addEventListener('click', () => {
                toggleSpecial(i, 'mobile', true, i === 1);
                if (i === 2) {
                    (getId('viewportMeta') as HTMLMetaElement).content = `width=device-width${globalSave.MDSettings[2] ? '' : ', minimum-scale=1.0, maximum-scale=1.0'}, initial-scale=1.0`;
                }
            });
            toggleSpecial(i, 'mobile');
        }
        if (globalSave.MDSettings[2]) { (getId('viewportMeta') as HTMLMetaElement).content = 'width=device-width, initial-scale=1.0'; }

        const refreshButton = document.createElement('button');
        refreshButton.className = 'hollowButton';
        refreshButton.textContent = 'Reload';
        refreshButton.type = 'button';
        mainLi.append(refreshButton);
        refreshButton.addEventListener('click', async() => {
            if (await Confirm('Reload the page?\n(Game will not autosave)')) { window.location.reload(); }
        });
    }
    if (globalSave.SRSettings[0]) {
        toggleSpecial(0, 'reader');
        const message = getId('SRMessage1');
        message.textContent = 'Screen reader support is enabled, disable it if its not required';
        message.className = 'greenText';
        message.ariaHidden = 'true';
        for (let i = 0; i <= 3; i++) {
            const effectID = getQuery(`#${i === 0 ? 'solarMass' : `star${i}`}Effect > span.info`);
            effectID.classList.remove('greenText');
            effectID.before(' (');
            effectID.after(')');
        }
        for (let i = 1; i <= 2; i++) {
            const effectID = getQuery(`#merge${i}Effect > span.info`);
            effectID.classList.remove('greenText');
            effectID.before(' (');
            effectID.after(')');
        }
        specialHTML.styleSheet.textContent += `#starEffects > p > span, #mergeEffects > p > span { display: unset !important; }
            #starEffects, #mergeEffects { cursor: default; } `;
        for (let i = 0; i < playerStart.strange.length; i++) {
            const html = getId(`strange${i}`);
            html.classList.add('noFocusOutline');
            html.tabIndex = 0;
        }

        const SRMainDiv = document.createElement('article');
        SRMainDiv.innerHTML = '<h5>Information for the Screen reader</h5><p id="SRTab" aria-live="polite"></p><p id="SRStage" aria-live="polite"></p><p id="SRMain" aria-live="assertive"></p>';
        SRMainDiv.className = 'reader';
        getId('fakeFooter').before(SRMainDiv);

        const SRToggle1 = document.createElement('li');
        SRToggle1.innerHTML = '<label>Keep tab index on created Upgrades<button type="button" id="SRToggle1" class="specialToggle">OFF</button></label>';
        const SRToggle2 = document.createElement('li');
        SRToggle2.innerHTML = '<label>Keep tab index on primary buttons<button type="button" id="SRToggle2" class="specialToggle">OFF</button></label>';
        getId('SRLi').after(SRToggle1, SRToggle2);

        const primaryIndex = () => {
            const newTab = globalSave.SRSettings[2] ? 0 : -1;
            for (const tabText of global.tabs.list) {
                getId(`${tabText}TabBtn`).tabIndex = newTab;
                for (const subtabText of global.tabs[tabText].list) {
                    getId(`${tabText}SubtabBtn${subtabText}`).tabIndex = newTab;
                }
            }
            for (let i = 1; i < global.stageInfo.word.length; i++) {
                getId(`stageSwitch${i}`).tabIndex = newTab;
            }
        };
        for (let i = 1; i < globalSaveStart.SRSettings.length; i++) {
            getId(`SRToggle${i}`).addEventListener('click', () => {
                toggleSpecial(i, 'reader', true);
                if (i === 2) {
                    primaryIndex();
                }
            });
            toggleSpecial(i, 'reader');
        }
        if (globalSave.SRSettings[2]) { primaryIndex(); }
    } else {
        const index = globalSave.toggles[0] ? 0 : 1;
        getQuery('#SRMessage1 span').textContent = `${globalSave.hotkeys.tabLeft[index]} and ${globalSave.hotkeys.tabRight[index]}`;
        getQuery('#SRMessage1 span:last-of-type').textContent = `${globalSave.hotkeys.subtabDown[index]} and ${globalSave.hotkeys.subtabUp[index]}`;
    }

    let oldVersion = player.version;
    const save = localStorage.getItem(specialHTML.localStorage.main);
    if (save !== null) {
        const load = JSON.parse(atob(save)) as typeof player;
        if (!load.version.includes('v0.2.6_temp')) { throw Error('Prevented save overwrite, if you for some reason using it on wrong website, then export it'); }
        oldVersion = updatePlayer(load);
    } else {
        prepareVacuum(false); //Set buildings values
        updatePlayer(deepClone(playerStart));
    }

    /* Global */
    assignHotkeys();
    const MD = globalSave.MDSettings[0];
    const SR = globalSave.SRSettings[0];
    const PC = !MD || globalSave.MDSettings[1];
    const htmlHTML = document.documentElement;
    const releaseHotkey = (event: KeyboardEvent | null) => {
        const hotkeys = global.hotkeys;
        if (hotkeys.shift && (event === null || event.key === 'Shift')) {
            hotkeys.shift = false;
            numbersUpdate();
        }
        if (hotkeys.ctrl && (event === null || event.key === 'Control')) {
            hotkeys.ctrl = false;
            numbersUpdate();
        }
        hotkeys.repeat = false;
        hotkeys.tab = false;
    };
    htmlHTML.addEventListener('contextmenu', (event) => {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType !== 'text' && activeType !== 'number' && !globalSave.developerMode) { event.preventDefault(); }
    });
    htmlHTML.addEventListener('keydown', (key) => detectHotkey(key));
    htmlHTML.addEventListener('keyup', releaseHotkey);
    if (PC) {
        htmlHTML.addEventListener('mouseup', cancelRepeat);
        htmlHTML.addEventListener('mouseleave', () => {
            releaseHotkey(null);
            cancelRepeat();
        });
    }
    if (MD) {
        htmlHTML.addEventListener('touchstart', (event) => {
            specialHTML.mobileDevice.start = [event.touches[0].clientX, event.touches[0].clientY];
        });
        htmlHTML.addEventListener('touchend', (event) => {
            cancelRepeat();
            const notAllowed = [getId('globalStats'), getId('footerMain')]; //[0] Shouldn't be changed
            for (let target = event.target as HTMLElement; target != null; target = target.parentElement as HTMLElement) {
                if (notAllowed.includes(target)) {
                    if (target !== notAllowed[0]) { notAllowed[0].style.opacity = '1'; }
                    return;
                }
            }
            notAllowed[0].style.opacity = '1';
            handleTouchHotkeys(event);
        });
        htmlHTML.addEventListener('touchcancel', () => {
            releaseHotkey(null);
            cancelRepeat();
        });
    }
    for (const element of getClass('hasTitle')) {
        const open = (event: MouseEvent) => {
            const window = getId('hoverWindow');
            window.textContent = element.dataset.title as string;
            window.style.display = '';
            position(event);
            element.addEventListener('mousemove', position);
            element.addEventListener('mouseleave', () => {
                window.style.display = 'none';
                element.removeEventListener('mousemove', position);
            }, { once: true });
        };
        const position = (event: MouseEvent) => {
            const window = getId('hoverWindow');
            window.style.left = `${Math.min(event.clientX, document.documentElement.clientWidth - window.getBoundingClientRect().width)}px`;
            window.style.top = `${event.clientY}px`;
        };
        element.addEventListener('mouseenter', open);
    }
    for (let i = 0; i < globalSaveStart.toggles.length; i++) {
        getId(`globalToggle${i}`).addEventListener('click', () => {
            toggleSpecial(i, 'global', true, i === 1 || i === 3);
            if (i === 0) {
                assignHotkeys();
                const index = globalSave.toggles[0] ? 0 : 1;
                for (const key in globalSaveStart.hotkeys) { getQuery(`#${key}Hotkey button`).textContent = globalSave.hotkeys[key as hotkeysList][index]; }
            } else if (i === 2) {
                document.body.classList[globalSave.toggles[2] ? 'remove' : 'add']('noTextSelection');
            } else if (i === 4) {
                getId('globalStats').style.display = !globalSave.toggles[4] ? '' : 'none';
                visualUpdate();
                numbersUpdate();
            }
        });
    }
    for (let i = 0; i < playerStart.toggles.normal.length; i++) {
        getId(`toggleNormal${i}`).addEventListener('click', () => toggleSwap(i, 'normal', true));
    }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) {
        getId(`toggleConfirm${i}`).addEventListener('click', () => toggleConfirm(i, true));
    }
    for (let i = 0; i < specialHTML.longestBuilding; i++) {
        getId(`toggleBuilding${i}`).addEventListener('click', () => toggleSwap(i, 'buildings', true));
    }
    for (let i = 0; i < playerStart.toggles.hover.length; i++) {
        getId(`toggleHover${i}`).addEventListener('click', () => toggleSwap(i, 'hover', true));
    }
    for (let i = 0; i < playerStart.toggles.max.length; i++) {
        getId(`toggleMax${i}`).addEventListener('click', () => toggleSwap(i, 'max', true));
    }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) {
        getId(`toggleAuto${i}`).addEventListener('click', () => {
            toggleSwap(i, 'auto', true);
            if (i === 5) {
                for (let s = 1; s <= 6; s++) { autoUpgradesSet(s); }
            } else if (i === 6) {
                for (let s = 1; s <= 6; s++) { autoResearchesSet('researches', s); }
            } else if (i === 7) {
                for (let s = 1; s <= 6; s++) { autoResearchesSet('researchesExtra', s); }
            } else if (i === 8) {
                autoElementsSet();
            }
        });
    }

    /* Stage tab */
    {
        const button = getId('reset2Button');
        const footer = getId('reset2Footer');
        const repeatFunc = () => repeatFunction(endResetUser);
        button.addEventListener('click', endResetUser);
        footer.addEventListener('click', endResetUser);
        if (PC) {
            button.addEventListener('mousedown', repeatFunc);
            footer.addEventListener('mousedown', repeatFunc);
        }
        if (MD) {
            button.addEventListener('touchstart', repeatFunc);
            footer.addEventListener('touchstart', repeatFunc);
        }
    } {
        const button = getId('reset1Button');
        const footer = getId('reset1Footer');
        const repeatFunc = () => repeatFunction(() => {
            if (player.inflation.vacuum || player.stage.active >= 4) { return; }
            void stageResetUser();
        });
        button.addEventListener('click', stageResetUser);
        footer.addEventListener('click', stageResetUser);
        if (PC) {
            button.addEventListener('mousedown', repeatFunc);
            footer.addEventListener('mousedown', repeatFunc);
        }
        if (MD) {
            button.addEventListener('touchstart', repeatFunc);
            footer.addEventListener('touchstart', repeatFunc);
        }
    } {
        const button = getId('reset0Button');
        const footer = getId('reset0Footer');
        const clickFunc = () => {
            const active = player.stage.active;
            if (active === 1) {
                void dischargeResetUser();
            } else if (active === 2) {
                void vaporizationResetUser();
            } else if (active === 3) {
                void rankResetUser();
            } else if (active === 4) {
                void collapseResetUser();
            } else if (active === 5) {
                void mergeResetUser();
            } else if (active === 6) {
                void nucleationResetUser();
            }
        };
        const repeatFunc = () => repeatFunction(() => {
            if (player.stage.active !== 1 && player.stage.active !== 3 && player.stage.active !== 6) { return; }
            clickFunc();
        });
        button.addEventListener('click', clickFunc);
        footer.addEventListener('click', clickFunc);
        if (PC) {
            button.addEventListener('mousedown', repeatFunc);
            footer.addEventListener('mousedown', repeatFunc);
        }
        if (MD) {
            button.addEventListener('touchstart', repeatFunc);
            footer.addEventListener('touchstart', repeatFunc);
        }
    } {
        const button = getId('resetExtraFooter');
        const clickFunc = () => {
            const active = player.stage.active;
            if (active === 4) {
                buyBuilding(3, 5);
            } else if (active === 5) {
                void collapseResetUser();
            } else if (active === 6) {
                void mergeResetUser();
            }
        };
        const repeatFunc = () => {
            repeatFunction(() => {
                if (player.stage.active !== 4) { return; }
                clickFunc();
            });
        };
        button.addEventListener('click', clickFunc);
        if (PC) { button.addEventListener('mousedown', repeatFunc); }
        if (MD) { button.addEventListener('touchstart', repeatFunc); }
    }
    const getMakeCount = () => global.hotkeys.shift ? (global.hotkeys.ctrl ? 100 : 1) : global.hotkeys.ctrl ? 10 : undefined;
    for (let i = 1; i < specialHTML.longestBuilding; i++) {
        const button = getId(`building${i}Btn`);
        const clickFunc = () => buyBuilding(i, player.stage.active, getMakeCount());
        button.addEventListener('click', clickFunc);
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
        if (MD) { button.addEventListener('touchstart', () => repeatFunction(clickFunc)); }
    }
    for (let i = 0; i < playerStart.verses.length; i++) {
        const button = getId(`verse${i}Btn`);
        const clickFunc = () => buyVerse(i);
        button.addEventListener('click', clickFunc);
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
        if (MD) { button.addEventListener('touchstart', () => repeatFunction(clickFunc)); }
    } {
        const button = getId('makeAllStructures');
        const footer = getId('structuresFooter');
        button.addEventListener('click', buyAll);
        footer.addEventListener('click', () => {
            if (global.hotkeys.shift) {
                toggleSwap(0, 'buildings', true);
            } else { buyAll(); }
        });
        if (PC) {
            button.addEventListener('mousedown', () => repeatFunction(buyAll));
            footer.addEventListener('mousedown', () => {
                if (!global.hotkeys.shift) { repeatFunction(buyAll); }
            });
        }
        if (MD) {
            button.addEventListener('touchstart', () => repeatFunction(buyAll));
            footer.addEventListener('touchstart', () => {
                if (!global.hotkeys.shift) { repeatFunction(buyAll); }
            });
        }
    }
    getId('buyAnyInput').addEventListener('focus', () => {
        const window = getQuery('#buyAnyMain > label');
        showAndFix(window);
        const input = getId('buyAnyInput') as HTMLInputElement;
        const change = () => {
            player.toggles.shop.input = Math.max(Math.trunc(Number(input.value)), 0);
            input.value = format(player.toggles.shop.input, { type: 'input' });
            numbersUpdate();
        };
        input.addEventListener('change', change);
        input.addEventListener('blur', () => {
            window.style.display = 'none';
            input.removeEventListener('change', change);
        }, { once: true });
    });
    getId('autoWaitInput').addEventListener('focus', () => {
        const window = getQuery('#autoWaitMain > label');
        showAndFix(window);
        const input = getId('autoWaitInput') as HTMLInputElement;
        const change = () => {
            if (!global.offline.active) {
                const value = Math.max(Number(input.value), 1);
                player.toggles.shop.wait[player.stage.active] = isNaN(value) ? 2 : value;
            }
            input.value = format(player.toggles.shop.wait[player.stage.active], { type: 'input' });
        };
        input.addEventListener('change', change);
        input.addEventListener('blur', () => {
            window.style.display = 'none';
            input.removeEventListener('change', change);
        }, { once: true });
    });

    for (let i = 0; i < global.challengesInfo.length; i++) {
        const image = getId(`challenge${i + 1}`);
        if (!MD) { image.addEventListener('mouseenter', () => hoverChallenge(i)); }
        image.addEventListener('click', () => { global.lastChallenge[0] === i ? enterExitChallengeUser(i) : hoverChallenge(i); });
    }
    getId('challengeName').addEventListener('click', () => { toggleSupervoid(true); });
    getId('rewardsType').addEventListener('click', () => {
        changeRewardType();
        getChallenge0Reward(global.lastChallenge[1]);
    });
    for (let s = 1; s <= 5; s++) {
        const image = getId(`voidReward${s}`);
        const clickFunc = () => {
            global.lastChallenge[1] = s;
            getChallenge0Reward(s);
        };
        image.addEventListener('mouseenter', clickFunc);
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                clickFunc();
            });
        }
    }

    /* Upgrade tab */
    for (let i = 0; i < specialHTML.longestUpgrade; i++) {
        const image = getId(`upgrade${i + 1}`);
        const hoverFunc = () => hoverUpgrades(i, 'upgrades');
        const clickFunc = () => buyUpgrades(i, player.stage.active, 'upgrades');
        if (PC) {
            image.addEventListener('mouseenter', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { clickFunc(); }
            });
        }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { repeatFunction(clickFunc); }
            });
        } else {
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const label = getId(`research${i + 1}`);
        const image = getQuery(`#research${i + 1} > input`);
        const hoverFunc = () => hoverUpgrades(i, 'researches');
        const clickFunc = () => buyUpgrades(i, player.stage.active, 'researches');
        if (PC) {
            label.addEventListener('mouseenter', hoverFunc);
            image.addEventListener('mouseenter', () => {
                if (player.toggles.hover[0]) { clickFunc(); }
            });
        }
        if (MD) {
            label.addEventListener('touchstart', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { repeatFunction(clickFunc); }
            });
        } else {
            label.addEventListener('mousedown', () => repeatFunction(clickFunc));
            image.addEventListener('click', clickFunc);
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const label = getId(`researchExtra${i + 1}`);
        const image = getQuery(`#researchExtra${i + 1} > input`);
        const hoverFunc = () => hoverUpgrades(i, 'researchesExtra');
        const clickFunc = () => buyUpgrades(i, player.stage.active, 'researchesExtra');
        if (PC) {
            label.addEventListener('mouseenter', hoverFunc);
            image.addEventListener('mouseenter', () => {
                if (player.toggles.hover[0]) { clickFunc(); }
            });
        }
        if (MD) {
            label.addEventListener('touchstart', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { repeatFunction(clickFunc); }
            });
        } else {
            label.addEventListener('mousedown', () => repeatFunction(clickFunc));
            image.addEventListener('click', clickFunc);
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) {
        const label = getId(`researchAuto${i + 1}`);
        const image = getQuery(`#researchAuto${i + 1} > input`);
        const hoverFunc = () => hoverUpgrades(i, 'researchesAuto');
        const clickFunc = () => handleAutoResearchCreation(i);
        if (PC) {
            label.addEventListener('mouseenter', hoverFunc);
            image.addEventListener('mouseenter', () => {
                if (player.toggles.hover[0]) { buyUpgrades(i, player.stage.active, 'researchesAuto'); }
            });
        }
        if (MD) {
            label.addEventListener('touchstart', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { repeatFunction(clickFunc); }
            });
        } else {
            label.addEventListener('mousedown', () => repeatFunction(clickFunc));
            image.addEventListener('click', clickFunc);
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    } {
        const label = getId('ASR');
        const image = getQuery('#ASR > input');
        const hoverFunc = () => hoverUpgrades(0, 'ASR');
        const clickFunc = () => buyUpgrades(0, player.stage.active, 'ASR');
        if (PC) {
            label.addEventListener('mouseenter', hoverFunc);
            image.addEventListener('mouseenter', () => {
                if (player.toggles.hover[0]) { clickFunc(); }
            });
        }
        if (MD) {
            label.addEventListener('touchstart', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { repeatFunction(clickFunc); }
            });
        } else {
            label.addEventListener('mousedown', () => repeatFunction(clickFunc));
            image.addEventListener('click', clickFunc);
        }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }
    if (MD) {
        const button = getId('upgradeCreate');
        const clickFunc = () => {
            const active = player.stage.active;
            const last = global.lastUpgrade[active];
            if (last[0] !== null) {
                if (last[1] === 'researchesAuto') { return handleAutoResearchCreation(last[0]); }
                buyUpgrades(last[0], active, last[1]);
            }
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }

    {
        const button = getId('element0');
        const dblclickFunc = () => {
            global.lastElement = 0;
            getUpgradeDescription(0, 'elements');
        };
        if (SR) {
            getId('element1').addEventListener('keydown', (event) => {
                if (event.code !== 'Tab' || detectShift(event) !== true) { return; }
                const element = getId('element0');
                element.tabIndex = 0;
                element.ariaHidden = 'false';
            });
            button.addEventListener('keydown', (event) => {
                if (event.code === 'Enter' && detectShift(event) === false) {
                    event.preventDefault();
                    dblclickFunc();
                }
            });
            button.addEventListener('blur', () => {
                const element = getId('element0');
                element.tabIndex = -1;
                element.ariaHidden = 'true';
            });
        }
        if (PC) { button.addEventListener('dblclick', dblclickFunc); }
        if (MD) {
            button.addEventListener('touchstart', () => {
                if (global.intervalsId.mouseRepeat !== undefined) { return; }
                global.intervalsId.mouseRepeat = setTimeout(dblclickFunc, 3000);
            });
        }
    }
    for (let i = 1; i < playerStart.elements.length; i++) {
        const image = getId(`element${i}`);
        const clickFunc = () => buyUpgrades(i, 4, 'elements');
        const hoverFunc = () => hoverUpgrades(i, 'elements');
        if (PC) {
            image.addEventListener('mouseenter', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { clickFunc(); }
            });
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverFunc();
                if (player.toggles.hover[0]) { clickFunc(); }
                repeatFunction(clickFunc);
            });
        } else { image.addEventListener('click', clickFunc); }
        if (PC || SR) {
            image.addEventListener('focus', () => {
                if (!global.hotkeys.tab) { return; }
                hoverFunc();
            });
        }
    }

    /* Strangeness tab */
    for (let i = 0; i < playerStart.strange.length; i++) {
        const button = getId(`strange${i}`);
        const open = (focus = false) => {
            if (i === 0 && player.stage.true < 6 && player.milestones[4][0] < 8) { return; }
            const html = getId(`strange${i}EffectsMain`);
            const button = getId(`strange${i}`);
            if (focus) {
                button.removeEventListener('mouseleave', close);
                button.addEventListener('blur', close, { once: true });
            } else {
                if (html.style.display !== 'none') { return; }
                button.addEventListener('mouseleave', close, { once: true });
            }
            html.style.display = '';
            numbersUpdate();
        };
        const close = () => { getId(`strange${i}EffectsMain`).style.display = 'none'; };
        button.addEventListener('mouseenter', () => open());
        if (SR) { button.addEventListener('focus', () => open(true)); }
    }
    for (let s = 1; s < playerStart.strangeness.length; s++) {
        if (MD) { getId(`strangenessPage${s}`).addEventListener('click', () => MDStrangenessPage(s)); }
        for (let i = 0; i < playerStart.strangeness[s].length; i++) {
            const label = getId(`strange${i + 1}Stage${s}`);
            const image = getQuery(`#strange${i + 1}Stage${s} > input`);
            const hoverFunc = () => hoverStrangeness(i, s, 'strangeness');
            const clickFunc = () => buyStrangeness(i, s, 'strangeness');
            if (PC) {
                label.addEventListener('mouseenter', hoverFunc);
                image.addEventListener('mouseenter', () => {
                    if (player.toggles.hover[1]) { clickFunc(); }
                });
            }
            if (MD) {
                label.addEventListener('touchstart', () => {
                    hoverFunc();
                    if (player.toggles.hover[1]) { repeatFunction(clickFunc); }
                });
            } else {
                label.addEventListener('mousedown', () => repeatFunction(clickFunc));
                image.addEventListener('click', clickFunc);
            }
            if (PC || SR) {
                image.addEventListener('focus', () => {
                    if (!global.hotkeys.tab) { return; }
                    hoverFunc();
                });
            }
        }
    }
    if (MD) {
        const button = getId('strangenessCreate');
        const clickFunc = () => {
            const last = global.lastStrangeness;
            if (last[0] !== null) { buyStrangeness(last[0], last[1], 'strangeness'); }
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }
    getId('strangenessVisibility').addEventListener('click', () => {
        global.sessionToggles[1] = !global.sessionToggles[1];
        getId('strangenessVisibility').textContent = `Permanent ones are ${global.sessionToggles[1] ? 'shown' : 'hidden'}`;
        visualUpdate();
    });

    for (let s = 1; s < playerStart.milestones.length; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            const image = getQuery(`#milestone${i + 1}Stage${s}Div > input`);
            const hoverFunc = () => hoverStrangeness(i, s, 'milestones');
            if (PC) { image.addEventListener('mouseenter', hoverFunc); }
            if (MD) { image.addEventListener('touchstart', hoverFunc); }
            if (PC || SR) {
                image.addEventListener('focus', () => {
                    if (!global.hotkeys.tab) { return; }
                    hoverFunc();
                });
            }
        }
    }

    /* Inflation tab */
    for (let s = 0; s <= 1; s++) {
        for (let i = 0; i < playerStart.tree[s].length; i++) {
            const label = getId(`inflation${i + 1}Tree${s + 1}`);
            const image = getQuery(`#inflation${i + 1}Tree${s + 1} > input`);
            const hoverFunc = () => hoverStrangeness(i, s, 'inflations');
            if (PC) { label.addEventListener('mouseenter', hoverFunc); }
            if (MD) {
                label.addEventListener('touchstart', hoverFunc);
            } else {
                const clickFunc = () => buyStrangeness(i, s, 'inflations');
                label.addEventListener('mousedown', () => repeatFunction(clickFunc));
                image.addEventListener('click', clickFunc);
            }
            if (PC || SR) {
                image.addEventListener('focus', () => {
                    if (!global.hotkeys.tab) { return; }
                    hoverFunc();
                });
            }
        }
    }
    {
        const button = getId('loadoutsName');
        button.addEventListener('change', () => { (getId('loadoutsName') as HTMLInputElement).value = (getId('loadoutsName') as HTMLInputElement).value.trim(); });
        button.addEventListener('keydown', (event) => {
            if (detectShift(event) === false && event.code === 'Enter') {
                event.preventDefault();
                loadoutsSave();
            }
        });
    }
    getId('inflationRefund').addEventListener('click', () => void inflationRefund(global.hotkeys.shift));
    getId('inflationLoadouts').addEventListener('click', () => {
        const windowHTML = getId('loadoutsMain');
        const status = windowHTML.style.display === 'none';
        if (status) {
            windowHTML.style.display = '';
            loadoutsVisual(global.loadouts.input);
        } else { windowHTML.style.display = 'none'; }
        if (globalSave.SRSettings[0]) { getId('inflationLoadouts').ariaExpanded = `${status}`; }
    });
    getId('loadoutsEdit').addEventListener('change', () => {
        const first = (getId('loadoutsEdit') as HTMLInputElement).value.split(',');
        const appeared = {} as Record<number, number>;
        const max = global.treeInfo[0].max;
        const final = [];
        for (let i = 0; i < first.length; i++) {
            const index = first[i].indexOf('x');
            let repeat = 1;
            if (index !== -1) {
                repeat = Number(first[i].slice(index + 1));
                first[i] = first[i].slice(0, index);
            }
            const number = Math.trunc(Number(first[i]) - 1);
            const inside = appeared[number] ?? 0;
            const maxRepeats = max[number] - inside;
            if (repeat > maxRepeats) { repeat = maxRepeats; }
            if (isNaN(maxRepeats) || isNaN(repeat) || repeat < 1) { continue; }
            appeared[number] = inside + repeat;
            for (let r = 0; r < repeat; r++) { final.push(number); }
        }
        global.loadouts.input = final;
        loadoutsVisual(final);
    });
    getId('loadoutsLoadAuto').addEventListener('click', () => {
        if (!global.hotkeys.shift) { (getId('loadoutsName') as HTMLInputElement).value = 'Auto-generate'; }
        loadoutsLoadAuto();
    });
    getId('loadoutsSave').addEventListener('click', loadoutsSave);
    getId('loadoutsLoad').addEventListener('click', () => void loadoutsLoad());
    getId('loadoutsMove').addEventListener('click', () => {
        const name = (getId('loadoutsName') as HTMLInputElement).value;
        let index;
        const loadouts = player.inflation.loadouts;
        for (let i = 0; i < loadouts.length; i++) {
            if (name === loadouts[i][0]) {
                index = i;
                break;
            }
        }
        if (index === undefined) { return; }
        const deleted = loadouts.splice(index, 1)[0];
        const newIndex = index + (global.hotkeys.shift ? -1 : 1);
        if (newIndex < 0) {
            loadouts.push(deleted);
        } else if (newIndex > loadouts.length) {
            loadouts.unshift(deleted);
        } else { loadouts.splice(newIndex, 0, deleted); }
        loadoutsRecreate();
    });
    getId('loadoutsDelete').addEventListener('click', () => {
        const loadouts = player.inflation.loadouts;
        const name = (getId('loadoutsName') as HTMLInputElement).value;
        let index;
        for (let i = 0; i < loadouts.length; i++) {
            if (name === loadouts[i][0]) {
                index = i;
                break;
            }
        }
        if (index === undefined) { return; }
        loadouts.splice(index, 1);
        loadoutsRecreate();
    });
    if (MD) {
        const button = getId('inflationActivate');
        const clickFunc = () => {
            if (global.lastInflation[0] !== null) { buyStrangeness(global.lastInflation[0], global.lastInflation[1], 'inflations'); }
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }

    /* Settings tab */
    for (const number of [0, 2, 4, 9]) {
        const button = getId(`toggleAuto${number}Info`);
        const open = (hover = false) => {
            const html = getId(`toggleAuto${number}Menu`);
            const button = getId(`toggleAuto${number}Info`);
            if (hover) {
                if (html.style.display !== 'none') { return; }
                button.addEventListener('mouseleave', close, { once: true });
            } else {
                const body = document.body;
                button.removeEventListener('mouseleave', close);
                body.removeEventListener('click', fullClose, { capture: true });
                body.addEventListener('click', fullClose, { capture: true });
            }
            showAndFix(html);
        };
        const close = () => { getId(`toggleAuto${number}Menu`).style.display = 'none'; };
        const fullClose = (event: MouseEvent) => {
            const html = getId(`toggleAuto${number}Menu`);
            for (let target = event.target as HTMLElement; target != null; target = target.parentElement as HTMLElement) {
                if (html === target) { return; }
            }
            document.body.removeEventListener('click', fullClose, { capture: true });
            html.style.display = 'none';
        };
        button.addEventListener('click', () => open());
        if (PC) { button.addEventListener('mouseenter', () => open(true)); }
    }
    getId('vaporizationInput').addEventListener('change', () => {
        const input = getId('vaporizationInput') as HTMLInputElement;
        if (!global.offline.active) { player.vaporization.input[0] = Math.max(Number(input.value), 0); }
        input.value = format(player.vaporization.input[0], { type: 'input' });
    });
    getId('vaporizationInputMax').addEventListener('change', () => {
        const input = getId('vaporizationInputMax') as HTMLInputElement;
        if (!global.offline.active) { player.vaporization.input[1] = Math.max(Number(input.value), 0); }
        input.value = format(player.vaporization.input[1], { type: 'input' });
    });
    getId('collapseInput').addEventListener('change', () => {
        const input = getId('collapseInput') as HTMLInputElement;
        if (!global.offline.active) { player.collapse.input[0] = Math.max(Number(input.value), 1); }
        input.value = format(player.collapse.input[0], { type: 'input' });
    });
    getId('collapseInputWait').addEventListener('change', () => {
        const input = getId('collapseInputWait') as HTMLInputElement;
        if (!global.offline.active) { player.collapse.input[1] = Number(input.value); }
        input.value = format(player.collapse.input[1], { type: 'input' });
    });
    getId('collapseAddNewPoint').addEventListener('change', () => {
        const input = getId('collapseAddNewPoint') as HTMLInputElement;
        const value = Number(input.value);
        input.value = '';
        if (global.offline.active) { return; }
        if (isFinite(value)) {
            if (value === 0) {
                player.collapse.points = [];
            } else {
                const points = player.collapse.points;
                const index = points.indexOf(Math.abs(value));
                if (value > 0 && index === -1) {
                    points.push(value);
                    points.sort((a, b) => a - b);
                } else if (value < 0 && index !== -1) {
                    points.splice(index, 1);
                    points.sort((a, b) => a - b);
                }
            }
        }
        global.collapseInfo.pointsLoop = 0;
        updateCollapsePoints();
    });
    getId('mergeInput').addEventListener('change', () => {
        const input = getId('mergeInput') as HTMLInputElement;
        if (!global.offline.active) { player.merge.input[0] = Math.max(Math.trunc(Number(input.value)), 0); }
        input.value = format(player.merge.input[0], { type: 'input' });
    });
    getId('mergeInputSince').addEventListener('change', () => {
        const input = getId('mergeInputSince') as HTMLInputElement;
        if (!global.offline.active) { player.merge.input[1] = Number(input.value); }
        input.value = format(player.merge.input[1], { type: 'input' });
    });
    getId('stageInput').addEventListener('change', () => {
        const input = getId('stageInput') as HTMLInputElement;
        if (!global.offline.active) { player.stage.input = Math.max(Number(input.value), 0); }
        input.value = format(player.stage.input, { type: 'input' });
    });
    getId('versionButton').addEventListener('click', openVersionInfo);
    getId('hotkeysButton').addEventListener('click', openHotkeys);
    getId('save').addEventListener('click', () => { saveGame(); });
    getId('file').addEventListener('change', async() => {
        const id = getId('file') as HTMLInputElement;
        try {
            loadGame(await (id.files as FileList)[0].text());
        } finally { id.value = ''; }
    });
    getId('export').addEventListener('click', () => {
        const exportReward = player.time.export;
        if ((player.stage.true >= 7 || player.strange[0].total > 0) && (player.challenges.active === null || global.challengesInfo[player.challenges.active].resetType === 'stage') && exportReward[0] > 0) {
            const { strange } = player;
            const improved = player.tree[0][5] >= 1;
            const conversion = Math.min(exportReward[0] / 86400_000, 1);
            const quarks = (improved ? exportReward[1] : exportReward[1] / 2.5 + 1) * conversion;

            strange[0].current += quarks;
            strange[0].total += quarks;
            exportReward[1] = Math.max(exportReward[1] - quarks, 0);
            if (player.strangeness[5][8] >= 1) {
                const strangelets = (improved ? exportReward[2] : exportReward[2] / 2.5) * conversion;
                strange[1].current += strangelets;
                strange[1].total += strangelets;
                exportReward[2] -= strangelets;
                assignBuildingsProduction.strange1();
            }
            assignBuildingsProduction.strange0();
            exportReward[0] = 0;
            numbersUpdate();
        }

        const save = saveGame(globalSave.developerMode);
        if (save === null) { return; }
        const a = document.createElement('a');
        a.href = `data:text/plain,${save}`;
        a.download = replaceSaveFileSpecials();
        a.click();
    });
    getId('saveConsole').addEventListener('click', async() => {
        let value = await Prompt("Available options:\n'Copy' ‒ copy save file to the clipboard\n'Delete' ‒ delete your save file\n'Clear' ‒ clear all the domain data\n'Global' ‒ open options for global settings\n(Adding '_' will skip options menu)\nOr insert save file text here to load it");
        if (value === null || value === '') { return; }
        let lower = value.trim().toLowerCase();
        if (lower === 'global') {
            value = await Prompt("Available options:\n'Reset' ‒ reset global settings\n'Copy' ‒ copy global settings to the clipboard\nOr insert global settings text here to load it");
            if (value === null || value === '') { return; }
            lower = `global_${value.trim().toLowerCase()}`;
        }

        if (lower === 'copy' || lower === 'global_copy') {
            const save = lower === 'global_copy' ? saveGlobalSettings(true) : saveGame(true);
            if (save !== null) {
                try {
                    await navigator.clipboard.writeText(save);
                    Notify(`${lower === 'global_copy' ? 'Settings have' : 'Save has'} been copied to the clipboard`);
                } catch (error) {
                    console.warn(`Full error for being unable to write to the clipboard:\n${error}`);
                    if (await Confirm("Could not copy text into clipboard, press 'Confrim' to save it as a file instead")) {
                        const a = document.createElement('a');
                        a.href = `data:text/plain,${save}`;
                        a.download = `Fundamental ${lower === 'global_copy' ? 'settings' : 'save'} clipboard`;
                        a.click();
                    }
                }
            }
        } else if (lower === 'delete' || lower === 'clear' || lower === 'global_reset') {
            pauseGame();
            if (lower === 'delete') {
                localStorage.removeItem(specialHTML.localStorage.main);
            } else if (lower === 'global_reset') {
                localStorage.removeItem(specialHTML.localStorage.settings);
            } else { localStorage.clear(); }
            window.location.reload();
            void Alert('Awaiting game reload');
        } else if (value === 'devMode') {
            globalSave.developerMode = !globalSave.developerMode;
            Notify(`Developer mode is ${globalSave.developerMode ? 'now' : 'no longer'} active`);
            saveGlobalSettings();
        } else if (lower === 'achievement') {
            Notify('Unlocked a new Achievement! (If there were any)');
        } else if (lower === 'slow' || lower === 'free' || lower === 'boost') {
            Notify('Game speed was increased by 1x');
        } else if (lower === 'secret' || lower === 'global_secret' || lower === 'secret_secret') {
            Notify(`Found a ${lower === 'secret_secret' ? "ultra rare secret, but it doesn't proof anything" : `${lower === 'global_secret' ? 'global' : 'rare'} secret, don't share it with anybody`}`);
        } else if (lower === 'secret_proof') {
            Notify('Found a proof that you were looking for!');
        } else if (lower === 'quantum') {
            getId('body').style.display = 'none';
            document.documentElement.style.backgroundColor = 'black';
            await Alert('Close when you are done enjoying the Quantum Vacuum');
            document.documentElement.style.backgroundColor = '';
            getId('body').style.display = '';
            addIntoLog('Experienced the Quantum Vacuum');
        } else {
            if (value.length < 20) { return void Alert(`Input '${value}' doesn't match anything`); }
            if (lower.includes('global_')) {
                if (!await Confirm("Press 'Confirm' to load input as a new global settings, this will reload the page\n(Input is too long to be displayed)")) { return; }
                localStorage.setItem(specialHTML.localStorage.settings, value[6] === '_' ? value.substring(7) : value);
                window.location.reload();
                void Alert('Awaiting game reload');
            } else {
                if (!await Confirm("Press 'Confirm' to load input as a save file\n(Input is too long to be displayed)")) { return; }
                loadGame(value);
            }
        }
    });
    getId('switchTheme0').addEventListener('click', () => setTheme(null));
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
    } {
        getId('saveFileNameInput').addEventListener('focus', () => {
            const window = getId('saveFileNameLabel');
            showAndFix(window);
            changePreview();
            const input = getId('saveFileNameInput') as HTMLInputElement;
            const change = () => {
                let testValue = input.value.trim();
                if (testValue.length < 1) {
                    testValue = playerStart.fileName;
                    input.value = testValue;
                }
                player.fileName = testValue;
            };
            input.addEventListener('change', change);
            input.addEventListener('input', changePreview);
            input.addEventListener('blur', () => {
                window.style.display = 'none';
                input.removeEventListener('input', changePreview);
                input.removeEventListener('change', change);
            }, { once: true });
        });
        const changePreview = () => {
            const value = (getId('saveFileNameInput') as HTMLInputElement).value.trim();
            getId('saveFileNamePreview').textContent = replaceSaveFileSpecials(value.length < 1 ? playerStart.fileName : value);
        };
    }
    getId('offlineInterval').addEventListener('change', () => {
        const input = getId('offlineInterval') as HTMLInputElement;
        globalSave.intervals.offline = Math.min(Math.max(Math.trunc(Number(input.value)), 20), 6000);
        input.value = `${globalSave.intervals.offline}`;
        saveGlobalSettings();
    });
    getId('numbersInterval').addEventListener('change', () => {
        const input = getId('numbersInterval') as HTMLInputElement;
        globalSave.intervals.numbers = Math.min(Math.max(Math.trunc(Number(input.value)), 40), 200);
        input.value = `${globalSave.intervals.numbers}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('visualInterval').addEventListener('change', () => {
        const input = getId('visualInterval') as HTMLInputElement;
        globalSave.intervals.visual = Math.min(Math.max(Math.trunc(Number(input.value)), 200), 2000);
        input.value = `${globalSave.intervals.visual}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('autoSaveInterval').addEventListener('change', () => {
        const input = getId('autoSaveInterval') as HTMLInputElement;
        globalSave.intervals.autoSave = Math.min(Math.max(Math.trunc(Number(input.value)), 4), 1800) * 1000;
        input.value = `${globalSave.intervals.autoSave / 1000}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('thousandSeparator').addEventListener('change', () => changeFormat(false));
    getId('decimalPoint').addEventListener('change', () => changeFormat(true));
    getId('MDToggle0').addEventListener('click', () => toggleSpecial(0, 'mobile', true, true));
    getId('SRToggle0').addEventListener('click', () => toggleSpecial(0, 'reader', true, true));
    getId('pauseButton').addEventListener('click', pauseGameUser);
    getId('showLog').addEventListener('click', openLog);
    getId('reviewEvents').addEventListener('click', replayEvent);
    getId('fullscreenButton').addEventListener('click', () => {
        if (document.fullscreenElement === null) {
            void document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        } else { void document.exitFullscreen(); }
    });
    getId('customFontSize').addEventListener('change', () => changeFontSize());

    getId('stageHistorySave').addEventListener('change', () => {
        const inputID = getId('stageHistorySave') as HTMLInputElement;
        player.history.stage.input[0] = Math.min(Math.max(Math.trunc(Number(inputID.value)), 0), 20);
        inputID.value = `${player.history.stage.input[0]}`;
    });
    getId('stageHistoryShow').addEventListener('change', () => {
        const input = getId('stageHistoryShow') as HTMLInputElement;
        player.history.stage.input[1] = Math.min(Math.max(Math.trunc(Number(input.value)), 10), 100);
        input.value = `${player.history.stage.input[1]}`;
        global.debug.historyStage = null;
        visualUpdate();
    });
    getId('endHistorySave').addEventListener('change', () => {
        const inputID = getId('endHistorySave') as HTMLInputElement;
        player.history.end.input[0] = Math.min(Math.max(Math.trunc(Number(inputID.value)), 0), 20);
        inputID.value = `${player.history.end.input[0]}`;
    });
    getId('endHistoryShow').addEventListener('change', () => {
        const input = getId('endHistoryShow') as HTMLInputElement;
        player.history.end.input[1] = Math.min(Math.max(Math.trunc(Number(input.value)), 10), 100);
        input.value = `${player.history.end.input[1]}`;
        global.debug.historyEnd = null;
        visualUpdate();
    });

    /* Footer */
    {
        const startEvent = (event: MouseEvent | TouchEvent) => {
            const mouse = event instanceof MouseEvent;
            const bodyMain = document.documentElement;
            const screenWidth = bodyMain.clientWidth;
            const screenHeight = bodyMain.clientHeight;

            const html = getId('globalStats');
            let lastX = mouse ? event.clientX : event.changedTouches[0].clientX;
            let lastY = mouse ? event.clientY : event.changedTouches[0].clientY;
            const move = (event: MouseEvent | TouchEvent) => {
                const newX = mouse ? (event as MouseEvent).clientX : (event as TouchEvent).changedTouches[0].clientX;
                const newY = mouse ? (event as MouseEvent).clientY : (event as TouchEvent).changedTouches[0].clientY;
                const current = html.getBoundingClientRect();
                html.style.right = `${(1 - Math.min(Math.max(current.right + newX - lastX, current.width), screenWidth) / screenWidth) * 100}%`;
                html.style.bottom = `${(1 - Math.min(Math.max(current.bottom + newY - lastY, current.height), screenHeight) / screenHeight) * 100}%`;
                lastX = newX;
                lastY = newY;

                if (!mouse) { html.style.opacity = '1'; }
            };
            const removeEvents = mouse ? () => {
                bodyMain.removeEventListener('mousemove', move);
                bodyMain.removeEventListener('mouseup', removeEvents);
                bodyMain.removeEventListener('mouseleave', removeEvents);
                html.style.opacity = '';
            } : () => {
                bodyMain.removeEventListener('touchmove', move);
                bodyMain.removeEventListener('touchend', removeEvents);
                bodyMain.removeEventListener('touchcancel', removeEvents);
            };
            if (mouse) {
                bodyMain.addEventListener('mousemove', move);
                bodyMain.addEventListener('mouseup', removeEvents);
                bodyMain.addEventListener('mouseleave', removeEvents);
                html.style.opacity = '1';
            } else {
                event.preventDefault(); //To prevent scrolling, doesn't work sometimes
                bodyMain.addEventListener('touchmove', move);
                bodyMain.addEventListener('touchend', removeEvents);
                bodyMain.addEventListener('touchcancel', removeEvents);
                html.style.opacity = '0.2';
            }
        };
        if (PC) { getId('globalStats').addEventListener('mousedown', startEvent); }
        if (MD) { getId('globalStats').addEventListener('touchstart', startEvent, { capture: true }); }
    }
    for (const tabText of global.tabs.list) {
        getId(`${tabText}TabBtn`).addEventListener('click', () => switchTab(tabText));
        for (const subtabText of global.tabs[tabText].list) {
            getId(`${tabText}SubtabBtn${subtabText}`).addEventListener('click', () => switchTab(tabText, subtabText));
        }
    }
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`stageSwitch${i}`).addEventListener('click', () => switchStage(i));
    }
    getId('shiftFooter').addEventListener('click', () => {
        global.hotkeys.shift = !global.hotkeys.shift;
        numbersUpdate();
    });

    /* Post */
    document.head.append(specialHTML.styleSheet);
    stageUpdate(true, true);
    if (globalSave.theme !== null) {
        getId('currentTheme').textContent = global.stageInfo.word[globalSave.theme];
        getId(`switchTheme${globalSave.theme}`).style.textDecoration = 'underline';
        getId('switchTheme0').style.textDecoration = '';
        setTheme();
    }
    if (save !== null) {
        global.lastSave = handleOfflineTime();
        Notify(`Welcome back, you were away for ${format(global.lastSave / 1000, { type: 'time', padding: false })}${oldVersion !== player.version ? `\nGame has been updated from ${oldVersion} to ${player.version}` : ''}${globalSave.developerMode ?
            `\nGame loaded after ${format((Date.now() - playerStart.time.started) / 1000, { type: 'time', padding: false })}` : ''}
        `);
        void simulateOffline(global.lastSave);
    } else {
        pauseGame(false);
    }
    getId('body').style.display = '';
    getId('loading').style.display = 'none';
    document.title = `Fundamental ${playerStart.version}`;
    specialHTML.cache.idMap.clear();
    specialHTML.cache.queryMap.clear();
    specialHTML.cache.classMap.clear();
} catch (error) {
    const stack = (error as { stack: string }).stack;
    void Alert(`Game failed to load\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`, 2);
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = '<button type="button" id="exportError" style="width: 7em;">Export save</button><button type="button" id="deleteError" style="width: 7em;">Delete save</button>';
    buttonDiv.style.cssText = 'display: flex; column-gap: 0.6em; margin-top: 0.4em;';
    getId('loading').append(buttonDiv);
    let exported = false;
    getId('exportError').addEventListener('click', () => {
        exported = true;
        const save = localStorage.getItem(specialHTML.localStorage.main);
        if (save === null) { return void Alert("Couldn't find any save files"); }
        const a = document.createElement('a');
        a.href = `data:text/plain,${save}`;
        a.download = 'Fundamental post error export';
        a.click();
    });
    getId('deleteError').addEventListener('click', async() => {
        if (!exported && !await Confirm("It's recommended to export save file first\nPress 'Confirm' to confirm and delete your save file")) { return; }
        localStorage.removeItem(specialHTML.localStorage.main);
        window.location.reload();
        void Alert('Awaiting game reload');
    });
    throw error;
}
