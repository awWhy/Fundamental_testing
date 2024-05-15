import { player, global, playerStart, updatePlayer, buildVersionInfo, deepClone } from './Player';
import { getUpgradeDescription, timeUpdate, switchTab, numbersUpdate, visualUpdate, format, maxOfflineTime, exportMultiplier, getChallengeDescription, getChallengeReward, stageUpdate, getStrangenessDescription, visualUpdateResearches } from './Update';
import { assignStrangeBoost, autoElementsSet, autoResearchesSet, autoUpgradesSet, buyBuilding, buyStrangeness, buyUpgrades, collapseAsyncReset, dischargeAsyncReset, enterExitChallenge, rankAsyncReset, stageAsyncReset, switchStage, toggleConfirm, toggleSwap, vaporizationAsyncReset } from './Stage';
import { Alert, hideFooter, Prompt, setTheme, changeFontSize, changeFormat, specialHTML, replayEvent, Confirm, preventImageUnload, Notify, MDStrangenessPage, globalSave, toggleSpecial, saveGlobalSettings } from './Special';
import { detectHotkey } from './Hotkeys';
import { prepareVacuum, switchVacuum } from './Vacuum';

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
    if (global.debug.errorID) {
        global.debug.errorID = false;
        Notify(`Error encountered, ID - '${id}' doesn't exist\n(More infomation in console)`);
        setTimeout(() => { global.debug.errorID = true; }, 6e4);
    }
    throw new ReferenceError(`ID - '${id}' doesn't exist`);
};
/** From cache, not document */
export const removeId = (id: string) => { specialHTML.cache.idMap.delete(id); };

/** Adding any new HTML to existing class will require reseting it */
export const getClass = (idCollection: string): HTMLCollectionOf<HTMLElement> => {
    const test = specialHTML.cache.classMap.get(idCollection);
    if (test !== undefined) { return test; }

    const store = document.getElementsByClassName(idCollection) as HTMLCollectionOf<HTMLElement>;
    specialHTML.cache.classMap.set(idCollection, store);
    return store;
};
//export const getRemoveClass = (idCollection: string) => { specialHTML.cache.classMap.delete(idCollection); };

/** Only for static HTML */
export const getQuery = (query: string): HTMLElement => {
    const test = specialHTML.cache.queryMap.get(query);
    if (test !== undefined) { return test; }

    const store = document.querySelector(query) as HTMLElement; //Can't add null type due to eslint being buggy
    if (store !== null) {
        specialHTML.cache.queryMap.set(query, store);
        return store;
    }

    if (global.debug.errorQuery) {
        global.debug.errorQuery = false;
        Notify(`Error encountered, Query - '${query}' failed to find anything\n(More infomation in console)`);
        setTimeout(() => { global.debug.errorQuery = true; }, 6e4);
    }
    throw new ReferenceError(`Query - '${query}' failed`);
};

const handleOfflineTime = (): number => {
    const time = player.time;
    const timeNow = Date.now();
    const offlineTime = (timeNow - time.updated) / 1000;
    time.updated = timeNow;
    time.offline = Math.min(time.offline + offlineTime, maxOfflineTime());
    player.stage.export = Math.min(player.stage.export + offlineTime, 86400);
    return offlineTime;
};

export const changeIntervals = () => {
    const intervalsId = global.intervalsId;
    const intervals = globalSave.intervals;
    const paused = global.paused;

    clearInterval(intervalsId.main);
    clearInterval(intervalsId.numbers);
    clearInterval(intervalsId.visual);
    clearInterval(intervalsId.autoSave);
    intervalsId.main = paused ? undefined : setInterval(timeUpdate, intervals.main);
    intervalsId.numbers = paused ? undefined : setInterval(numbersUpdate, intervals.numbers);
    intervalsId.visual = paused ? undefined : setInterval(visualUpdate, intervals.visual);
    intervalsId.autoSave = paused ? undefined : setInterval(saveGame, intervals.autoSave);
};

const saveGame = async(returnOnly = false): Promise<string | null> => {
    if (global.paused) {
        Notify('No saving while game is paused');
        return null;
    }
    try {
        player.history.stage.list = global.historyStorage.stage.slice(0, player.history.stage.input[0]);

        const save = btoa(JSON.stringify(player));
        if (!returnOnly) {
            localStorage.setItem('testing_save', save);
            clearInterval(global.intervalsId.autoSave);
            global.intervalsId.autoSave = setInterval(saveGame, globalSave.intervals.autoSave);
            getId('isSaved').textContent = 'Saved';
            global.lastSave = 0;
        }
        return save;
    } catch (error) {
        const stack = (error as { stack: string }).stack;
        void Alert(`Failed to save game\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`);
        throw error;
    }
};
const loadGame = (save: string) => {
    if (global.paused) { return Notify('No loading while game is paused'); }
    global.paused = true;
    changeIntervals();
    try {
        const versionCheck = updatePlayer(JSON.parse(atob(save)));

        global.lastSave = handleOfflineTime();
        Notify(`This save is ${format(global.lastSave, { type: 'time', padding: false })} old. Save file version is ${versionCheck}`);
        stageUpdate('reload');
    } catch (error) { void Alert(`Incorrect save file format\n${error}`); }
    global.paused = false;
    changeIntervals();
};
const exportFileGame = async() => {
    if (player.stage.resets >= (player.inflation.vacuum ? 1 : 4) && player.stage.export > 0) {
        const rewardType = player.strangeness[5][8];
        const multiplier = exportMultiplier();

        let strangeGain;
        if (rewardType >= 1) {
            strangeGain = player.stage.export * multiplier / 86400 / 1e12 ** rewardType;
            player.stage.export = 0;
        } else {
            strangeGain = Math.floor(player.stage.export * multiplier / 86400);
            player.stage.export -= strangeGain * 86400 / multiplier;
        }
        player.strange[rewardType].current += strangeGain;
        player.strange[rewardType].total += strangeGain;
        if (rewardType === 0) { assignStrangeBoost(); }
    }

    const save = await saveGame(true);
    if (save === null) { return; }
    const a = document.createElement('a');
    a.href = `data:text/plain,${save}`;
    a.download = replaceSaveFileSpecials();
    a.click();
};
const saveConsole = async() => {
    const value = await Prompt("Available options:\n'Copy' - copy save file to clipboard\n'Delete' - delete your save file\n'Reset' - reset game global settings\n'Clear' - clear all domain data\nOr insert save file string here to load it");
    if (value === null || value === '') { return; }
    const lower = value.toLowerCase();

    if (lower === 'copy') {
        const save = await saveGame(true);
        if (save !== null) { void navigator.clipboard.writeText(save); }
    } else if (lower === 'delete' || lower === 'reset' || lower === 'clear') {
        global.paused = true;
        changeIntervals();
        if (lower === 'delete') {
            localStorage.removeItem('testing_save');
        } else if (lower === 'reset') {
            localStorage.removeItem('fundamentalSettings');
        } else { localStorage.clear(); }
        window.location.reload();
        void Alert('Awaiting game reload');
    } else if (value === 'devMode') {
        globalSave.developerMode = !globalSave.developerMode;
        Notify(`Developer mode is ${globalSave.developerMode ? 'now' : 'no longer'} active`);
        saveGlobalSettings();
    } else if (lower === 'achievement') {
        Notify('Unlocked a new Achievement');
    } else if (lower === 'slow' || lower === 'free') {
        Notify('Game speed was increased by 1x');
    } else if (lower === 'neutronium' || lower === 'element0') {
        Notify(`${global.elementsInfo.effectText[0]().replace('this', 'Elements')}`);
    } else {
        if (value.length < 20) { return void Alert(`Input '${value}' doesn't match anything`); }
        if (!await Confirm("Press 'Confirm' to load input as a save file\n(Input is too long to be displayed)")) { return; }
        loadGame(value);
    }
};

const replaceSaveFileSpecials = (): string => {
    let realName = player.fileName;

    const date = new Date();
    const dateIndex = realName.indexOf('[date');
    if (dateIndex >= 0) {
        const endIndex = realName.indexOf(']', dateIndex + 5);
        if (endIndex >= 0) {
            let replaced = realName.substring(dateIndex + 5, endIndex);
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
            realName = realName.replace(realName.substring(dateIndex, endIndex + 1), replaced);
        }
    }
    const timeIndex = realName.indexOf('[time');
    if (timeIndex >= 0) {
        const endIndex = realName.indexOf(']', timeIndex + 5);
        if (endIndex >= 0) {
            let replaced = realName.substring(timeIndex + 5, endIndex);
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
            realName = realName.replace(realName.substring(timeIndex, endIndex + 1), replaced);
        }
    }

    const special = [
        '[stage]',
        '[true]',
        '[strange]',
        '[matter]',
        '[vacuum]'
    ];
    const replaceWith = [
        global.stageInfo.word[player.stage.active],
        global.stageInfo.word[player.stage.true],
        `${global.strangeInfo.gain(player.stage.active)}`,
        `${global.strangeInfo.name[player.strangeness[5][8]]}`,
        `${player.inflation.vacuum}`
    ];
    for (let i = 0; i < special.length; i++) {
        realName = realName.replace(special[i], replaceWith[i]);
    }
    return `${realName}.txt`;
};

/* Arguments are not done as '(...data: any) => any, ...data: any' because TS wont do type safety */
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

const hoverUpgrades = (index: number, type: 'upgrades' | 'researches' | 'researchesExtra' | 'researchesAuto' | 'ASR' | 'elements') => {
    if (player.toggles.hover[0] && player.stage.true >= 4) { buyUpgrades(index, player.stage.active, type); }
    if (type === 'elements') {
        global.lastElement = index;
    } else { global.lastUpgrade[player.stage.active] = [index, type]; }
    getUpgradeDescription(index, type);
};
const hoverStrangeness = (index: number, stageIndex: number, type: 'strangeness' | 'milestones') => {
    if (type === 'strangeness') {
        global.lastStrangeness = [index, stageIndex];
    } else { global.lastMilestone = [index, stageIndex]; }
    getStrangenessDescription(index, stageIndex, type);
};
const hoverChallenge = (index: number, type: 'challenge' | 'reward') => {
    if (type === 'challenge') {
        global.lastChallenge[0] = index;
        getChallengeDescription(index);
    } else {
        global.lastChallenge[1] = index;
        getChallengeReward(index);
    }
};

export const buyAll = () => {
    const active = player.stage.active;
    for (let i = 1; i < specialHTML.longestBuilding; i++) {
        buyBuilding(i, active, 0);
    }
};

export const timeWarp = async() => {
    if (global.paused) { return Notify('No warping while game is paused'); }
    const offline = player.time.offline;
    if (offline < 60) { return void Alert('Need at least 1 minute in Offline storage to Warp'); }
    let warpTime: number = player.stage.true < 5 ? (await Confirm(`Ready to use Offline?\n(Offline storage is ${format(offline, { type: 'time', padding: false })})`) ? offline : 0) :
        Math.min(Number(await Prompt(`How many seconds to Warp?\n(Offline storage is ${format(offline, { digits: 0 })} seconds)\nNot using entire Offline storage will remove additional time from storage without using it (from half an hour up to same amount as Warp time)`, '1800')), offline);
    if (warpTime < 60 || !isFinite(warpTime)) { return warpTime > 0 ? void Alert('Warp has to be at least 1 minute') : undefined; }
    if (warpTime < offline) {
        const remove = Math.max(warpTime, 1800);
        if (warpTime + remove >= offline) {
            warpTime = offline;
        } else { player.time.offline -= remove; }
    }

    global.paused = true;
    changeIntervals();
    getId('alertMain').style.display = 'none';
    getId('warpMain').style.display = '';
    getId('blocker').style.display = '';
    warpMain(warpTime);
    player.time.offline -= warpTime;
};
const warpMain = (warpTime: number, start = warpTime) => {
    const time = Math.min(600, warpTime);
    warpTime -= time;
    try {
        timeUpdate(time);
    } catch (error) {
        warpEnd();
        const stack = (error as { stack: string }).stack;
        void Alert(`Warp failed\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`);
        throw error;
    }
    if (warpTime > 0) {
        setTimeout(warpMain, 0, warpTime, start);
        getId('warpRemains').textContent = format(warpTime, { type: 'time' });
        getId('warpPercentage').textContent = format(100 - warpTime / start * 100, { padding: true });
        if (globalSave.SRSettings[0]) { getId('warpMain').setAttribute('aria-valuetext', `${format(100 - warpTime / start * 100)}% done`); }
    } else { warpEnd(); }
    numbersUpdate();
    visualUpdate();
};
const warpEnd = () => {
    Notify(`Warp ended after ${format(handleOfflineTime(), { type: 'time', padding: false })}`);
    global.paused = false;
    changeIntervals();
    getId('blocker').style.display = 'none';
    getId('warpMain').style.display = 'none';
    getId('alertMain').style.display = '';
};

const pauseGame = async() => {
    if (global.paused) { return Notify('Game is already paused'); }
    global.paused = true;
    changeIntervals();
    await Alert("Game is currently paused. Press 'confirm' to unpause it. Time spent here will be moved into Offline storage");

    const offline = handleOfflineTime();
    Notify(`Game was paused for ${format(offline, { type: 'time', padding: false })}`);
    global.lastSave += offline;
    global.paused = false;
    changeIntervals();
    numbersUpdate();
    visualUpdate();
};

try { //Start everything
    preventImageUnload();

    const globalSettings = localStorage.getItem('fundamentalSettings');
    if (globalSettings !== null) {
        Object.assign(globalSave, JSON.parse(atob(globalSettings)));
        (getId('decimalPoint') as HTMLInputElement).value = globalSave.format[0];
        (getId('thousandSeparator') as HTMLInputElement).value = globalSave.format[1];
        (getId('mainInterval') as HTMLInputElement).value = `${globalSave.intervals.main}`;
        (getId('numbersInterval') as HTMLInputElement).value = `${globalSave.intervals.numbers}`;
        (getId('visualInterval') as HTMLInputElement).value = `${globalSave.intervals.visual / 1000}`;
        (getId('autoSaveInterval') as HTMLInputElement).value = `${globalSave.intervals.autoSave / 1000}`;
        for (let i = 0; i < globalSave.toggles.length; i++) { toggleSpecial(i, 'normal'); }
        changeFontSize();

        if (globalSave.MDSettings[0]) {
            (document.getElementById('MDMessage1') as HTMLElement).remove();
            specialHTML.styleSheet.textContent += 'input[type = "image"], img { -webkit-touch-callout: none; }'; //Safari junk to disable image hold menu
            specialHTML.styleSheet.textContent += '#themeArea.windowOpen > div > div { display: flex; } #themeArea.windowOpen > div > button { clip-path: circle(0); }'; //More Safari junk to make windows work without focus
            (getId('file') as HTMLInputElement).accept = ''; //Accept for unknown reason not properly supported on phones

            const stageButton = document.createElement('button');
            stageButton.textContent = 'Stage';
            stageButton.id = 'stageFooter';
            stageButton.type = 'button';
            const reset1Button = document.createElement('button');
            reset1Button.id = 'reset1Footer';
            reset1Button.type = 'button';
            getId('phoneHotkeys').prepend(reset1Button, stageButton);

            const createUpgButton = document.createElement('button');
            createUpgButton.classList.add('hollowButton');
            createUpgButton.textContent = 'Create';
            createUpgButton.id = 'upgradeCreate';
            createUpgButton.type = 'button';
            specialHTML.styleSheet.textContent += '#upgradeCreate { height: 1.76em; padding: 0 0.44em; border-radius: 2px; font-size: 0.92em; }';
            getId('toggleHover0').after(createUpgButton);

            const pages = document.createElement('div');
            pages.id = 'strangenessPages';
            pages.innerHTML = '<button type="button" id="strangenessPage1" class="stage1borderImage hollowButton">1</button><button type="button" id="strangenessPage2" class="stage2borderImage hollowButton">2</button><button type="button" id="strangenessPage3" class="stage3borderImage hollowButton">3</button><button type="button" id="strangenessPage4" class="stage4borderImage hollowButton">4</button><button type="button" id="strangenessPage5" class="stage5borderImage hollowButton">5</button><button type="button" id="strangenessCreate" class="hollowButton">Create</button>';
            specialHTML.styleSheet.textContent += '#strangenessPages { display: flex; justify-content: center; column-gap: 0.3em; } #strangenessPages button { width: 2.08em; height: calc(2.08em - 2px); border-top: none; border-radius: 0 0 4px 4px; } #strangenessCreate { width: unset !important; padding: 0 0.4em; }';
            getId('strangenessResearch').append(pages);

            const MDToggle1 = document.createElement('li');
            MDToggle1.innerHTML = '<label>Keep mouse events<button type="button" id="MDToggle1" class="specialToggle">OFF</button></label>';
            getId('MDLi').after(MDToggle1);

            getId('MDToggle1').addEventListener('click', () => toggleSpecial(1, 'mobile', true, true));
            for (let i = 0; i < globalSave.MDSettings.length; i++) { toggleSpecial(i, 'mobile'); }
        }
        if (globalSave.SRSettings[0]) {
            (document.getElementById('SRMessage1') as HTMLElement).remove();
            for (let i = 0; i < 3; i++) {
                const effectID = getId(i === 0 ? 'solarMassExplanation' : `star${i}Explanation`);
                effectID.textContent = ` (${effectID.textContent})`;
            }

            const SRMainDiv = document.createElement('article');
            SRMainDiv.innerHTML = '<h3>Information for Screen reader</h3><p id="SRTab" aria-live="polite"></p><p id="SRStage" aria-live="polite"></p><p id="SRMain" aria-live="assertive"></p>';
            SRMainDiv.className = 'reader';
            getId('fakeFooter').before(SRMainDiv);

            const SRToggle1 = document.createElement('li');
            SRToggle1.innerHTML = '<label>Keep tab index on created Upgrades<button type="button" id="SRToggle1" class="specialToggle">OFF</button></label>';
            const SRToggle2 = document.createElement('li');
            SRToggle2.innerHTML = '<label>Keep tab index on primary buttons<button type="button" id="SRToggle2" class="specialToggle">OFF</button></label>';
            getId('SRLi').after(SRToggle1, SRToggle2);

            getId('SRToggle1').addEventListener('click', () => {
                toggleSpecial(1, 'reader', true);
                stageUpdate('reload');
                for (let s = 1; s < player.strangeness.length; s++) {
                    for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
                        visualUpdateResearches(i, s, 'strangeness');
                    }
                }
            });

            const primaryIndex = (reload = false) => {
                if (!reload) { toggleSpecial(2, 'reader', true); }
                const newTab = globalSave.SRSettings[2] ? 0 : -1;
                getId('stageReset').tabIndex = newTab;
                getId('reset1Button').tabIndex = newTab;
                for (let i = 1; i < specialHTML.longestBuilding; i++) {
                    getId(`building${i}Btn`).tabIndex = newTab;
                    getId(`toggleBuilding${i}`).tabIndex = newTab;
                }
                getId('toggleBuilding0').tabIndex = newTab;
                for (const tabText of global.tabList.tabs) {
                    getId(`${tabText}TabBtn`).tabIndex = newTab;
                    const tabList = global.tabList[`${tabText as 'stage'}Subtabs`] as string[] | undefined;
                    if (tabList === undefined) { continue; }
                    for (const subtabText of tabList) {
                        getId(`${tabText}SubtabBtn${subtabText}`).tabIndex = newTab;
                    }
                }
                for (let i = 1; i < global.stageInfo.word.length; i++) {
                    getId(`${global.stageInfo.word[i]}Switch`).tabIndex = newTab;
                }
            };
            getId('SRToggle2').addEventListener('click', () => { primaryIndex(); });

            if (globalSave.SRSettings[2]) { primaryIndex(true); }
            for (let i = 0; i < globalSave.SRSettings.length; i++) { toggleSpecial(i, 'reader'); }
            specialHTML.styleSheet.textContent += '#starEffects > p > span { display: unset !important; }';
        }
    }

    let alertText;
    const save = localStorage.getItem('testing_save');
    if (save !== null) {
        const versionCheck = updatePlayer(JSON.parse(atob(save)));
        global.lastSave = handleOfflineTime();
        alertText = `Welcome back, you were away for ${format(global.lastSave, { type: 'time', padding: false })}\n${versionCheck !== player.version ? `Game have been updated from ${versionCheck} to ${player.version}` : `Current version is ${player.version}`}`;
    } else {
        prepareVacuum(false); //Set buildings values
        updatePlayer(deepClone(playerStart));
        alertText = `Welcome to 'Fundamental' ${player.version}, a test-project created by awWhy\n(This idle game is not meant to be fast)`;
    }

    if (globalSave.toggles[1]) {
        const elementsArea = getId('upgradeSubtabElements');
        elementsArea.id = 'ElementsTab';
        getId('upgradeTab').after(elementsArea);
        removeId('upgradeSubtabElements');

        const elementsButton = getId('upgradeSubtabBtnElements');
        elementsButton.id = 'ElementsTabBtn';
        elementsButton.classList.add('stage4Include');
        getId('upgradeTabBtn').after(elementsButton);
        removeId('upgradeSubtabBtnElements');

        const tabList = global.tabList;
        tabList.upgradeSubtabs.splice(tabList.upgradeSubtabs.indexOf('Elements'), 1);
        tabList.tabs.splice(tabList.tabs.indexOf('upgrade') + 1, 0, 'Elements');
    }

    /* Global */
    const MD = globalSave.MDSettings[0];
    const SR = globalSave.SRSettings[0];
    const PC = !MD || globalSave.MDSettings[1];
    const body = document.body;
    body.addEventListener('keydown', (key: KeyboardEvent) => detectHotkey(key));
    const releaseHotkey = (event: KeyboardEvent | MouseEvent) => {
        if (global.hotkeys.shift && !event.shiftKey) { global.hotkeys.shift = false; }
        if (global.hotkeys.ctrl && !event.ctrlKey) { global.hotkeys.ctrl = false; }
    };
    body.addEventListener('keyup', releaseHotkey);
    body.addEventListener('contextmenu', (event) => {
        if (!globalSave.developerMode) { event.preventDefault(); }
    });
    if (PC) {
        body.addEventListener('mouseup', (event) => {
            cancelRepeat();
            releaseHotkey(event);
        });
        body.addEventListener('mouseleave', cancelRepeat);
    }
    if (MD) {
        body.addEventListener('touchend', cancelRepeat);
        body.addEventListener('touchcancel', cancelRepeat);
    }

    /* Toggles */
    for (let i = 0; i < globalSave.toggles.length; i++) {
        getId(`toggleNormal${i}`).addEventListener('click', () => toggleSpecial(i, 'normal', true, i === 1));
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
        getId(`toggleAuto${i}`).addEventListener('click', () => toggleSwap(i, 'auto', true));
    }

    /* Stage tab */
    getId('stageReset').addEventListener('click', stageAsyncReset);
    if (MD) { getId('stageFooter').addEventListener('click', stageAsyncReset); }
    {
        const clickFunc = () => {
            const active = player.stage.active;
            if (active === 1) {
                void dischargeAsyncReset();
            } else if (active === 2) {
                void vaporizationAsyncReset();
            } else if (active === 3) {
                void rankAsyncReset();
            } else if (active === 4) {
                void collapseAsyncReset();
            }
        };
        getId('reset1Button').addEventListener('click', clickFunc);
        if (MD) { getId('reset1Footer').addEventListener('click', clickFunc); }
    }
    for (let i = 1; i < specialHTML.longestBuilding; i++) {
        const button = getId(`building${i}Btn`);
        const clickFunc = () => buyBuilding(i);
        button.addEventListener('click', clickFunc);
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
        if (MD) { button.addEventListener('touchstart', () => repeatFunction(clickFunc)); }
    }
    {
        const button = getId('makeAllStructures');
        button.addEventListener('click', buyAll);
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(buyAll)); }
        if (MD) { button.addEventListener('touchstart', () => repeatFunction(buyAll)); }
    }
    getId('buyAnyInput').addEventListener('change', () => {
        const input = getId('buyAnyInput') as HTMLInputElement;
        player.toggles.shop.input = Math.max(Math.trunc(Number(input.value)), 0);
        input.value = format(player.toggles.shop.input, { type: 'input' });
        numbersUpdate();
    });
    getId('autoWaitInput').addEventListener('change', () => {
        const input = getId('autoWaitInput') as HTMLInputElement;
        let value = Math.max(Number(input.value), 1);
        if (isNaN(value)) { value = 2; }
        player.toggles.shop.wait[player.stage.active] = value;
        input.value = format(value, { type: 'input' });
    });

    for (let i = -1; i < global.challengesInfo.name.length; i++) {
        const image = getId(`challenge${i + 1}`);
        if (PC) { image.addEventListener('mouseover', () => hoverChallenge(i, 'challenge')); }
        if (MD) { image.addEventListener('touchstart', () => hoverChallenge(i, 'challenge')); }
        if (SR) { image.addEventListener('focus', () => hoverChallenge(i, 'challenge')); }
        image.addEventListener('click', i === -1 ? switchVacuum : () => { void enterExitChallenge(i); });
    }
    for (let i = 1; i < global.challengesInfo.rewardText[0].length; i++) {
        const image = getId(`voidReward${global.stageInfo.word[i]}`);
        image.addEventListener('click', () => hoverChallenge(i, 'reward'));
        if (MD) { image.addEventListener('click', () => (getId('voidRewardsDiv').style.display = 'block')); } //Safari bugs with no focus events
    }
    if (MD) { getId('voidRewardsDiv').addEventListener('click', () => (getId('voidRewardsDiv').style.display = '')); }

    /* Upgrade tab */
    for (let i = 0; i < specialHTML.longestUpgrade; i++) {
        const image = getId(`upgrade${i + 1}`);
        const hoverFunc = () => hoverUpgrades(i, 'upgrades');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverUpgrades(i, 'upgrades');
                repeatFunction(hoverFunc);
            });
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'upgrades');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (SR) { image.addEventListener('focus', hoverFunc); }
    }
    for (let i = 0; i < specialHTML.longestResearch; i++) {
        const image = getId(`research${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'researches');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverUpgrades(i, 'researches');
                repeatFunction(hoverFunc);
            });
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'researches');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (SR) { image.addEventListener('focus', hoverFunc); }
    }
    for (let i = 0; i < specialHTML.longestResearchExtra; i++) {
        const image = getId(`researchExtra${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'researchesExtra');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverUpgrades(i, 'researchesExtra');
                repeatFunction(hoverFunc);
            });
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'researchesExtra');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (SR) { image.addEventListener('focus', hoverFunc); }
    }
    for (let i = 0; i < global.researchesAutoInfo.costRange.length; i++) {
        const image = getId(`researchAuto${i + 1}Image`);
        const hoverFunc = () => hoverUpgrades(i, 'researchesAuto');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverUpgrades(i, 'researchesAuto');
                repeatFunction(hoverFunc);
            });
        } else {
            const clickFunc = () => buyUpgrades(i, player.stage.active, 'researchesAuto');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (SR) { image.addEventListener('focus', hoverFunc); }
    }
    {
        const image = getId('ASRImage');
        const hoverFunc = () => hoverUpgrades(0, 'ASR');
        if (PC) { image.addEventListener('mouseover', hoverFunc); }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverUpgrades(0, 'ASR');
                repeatFunction(hoverFunc);
            });
        } else {
            const clickFunc = () => buyUpgrades(0, player.stage.active, 'ASR');
            image.addEventListener('click', clickFunc);
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (SR) { image.addEventListener('focus', hoverFunc); }
    }
    if (MD) {
        const button = getId('upgradeCreate');
        const clickFunc = () => {
            const active = player.stage.active;
            buyUpgrades(global.lastUpgrade[active][0], active, global.lastUpgrade[active][1]);
        };
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }

    if (PC) {
        getId('element0').addEventListener('dblclick', () => {
            global.lastElement = 0;
            getUpgradeDescription(0, 'elements');
        });
    }
    for (let i = 1; i < global.elementsInfo.startCost.length; i++) {
        const image = getId(`element${i}`);
        const clickFunc = () => buyUpgrades(i, 4, 'elements');
        if (PC) {
            image.addEventListener('mouseover', () => hoverUpgrades(i, 'elements'));
            image.addEventListener('mousedown', () => repeatFunction(clickFunc));
        }
        if (MD) {
            image.addEventListener('touchstart', () => {
                hoverUpgrades(i, 'elements');
                repeatFunction(clickFunc);
            });
        }
        if (SR) { image.addEventListener('focus', () => hoverUpgrades(i, 'elements')); }
        if (PC || SR) { image.addEventListener('click', clickFunc); }
    }

    /* Strangeness tab */
    for (let s = 1; s < global.strangenessInfo.length; s++) {
        if (MD) { getId(`strangenessPage${s}`).addEventListener('click', () => MDStrangenessPage(s)); }
        for (let i = 0; i < global.strangenessInfo[s].startCost.length; i++) {
            const image = getId(`strange${i + 1}Stage${s}Image`);
            const hoverFunc = () => hoverStrangeness(i, s, 'strangeness');
            if (PC) { image.addEventListener('mouseover', hoverFunc); }
            if (MD) {
                image.addEventListener('touchstart', () => {
                    hoverStrangeness(i, s, 'strangeness');
                    //repeatFunction(hoverFunc);
                });
            } else {
                const clickFunc = () => buyStrangeness(i, s, 'strangeness');
                image.addEventListener('click', clickFunc);
                image.addEventListener('mousedown', () => repeatFunction(clickFunc));
            }
            if (SR) { image.addEventListener('focus', hoverFunc); }
        }
    }
    if (MD) {
        const button = getId('strangenessCreate');
        const clickFunc = () => buyStrangeness(global.lastStrangeness[0], global.lastStrangeness[1], 'strangeness');
        button.addEventListener('click', clickFunc);
        button.addEventListener('touchstart', () => repeatFunction(clickFunc));
        if (PC) { button.addEventListener('mousedown', () => repeatFunction(clickFunc)); }
    }
    for (let s = 1; s < global.milestonesInfo.length; s++) {
        for (let i = 0; i < global.milestonesInfo[s].need.length; i++) {
            const image = getQuery(`#milestone${i + 1}Stage${s}Div > img`);
            if (PC) { image.addEventListener('mouseover', () => hoverStrangeness(i, s, 'milestones')); }
            if (MD) { image.addEventListener('touchstart', () => hoverStrangeness(i, s, 'milestones')); }
            if (SR) { image.addEventListener('focus', () => hoverStrangeness(i, s, 'milestones')); }
        }
    }

    /* Settings tab */
    getId('vaporizationInput').addEventListener('change', () => {
        const input = getId('vaporizationInput') as HTMLInputElement;
        player.vaporization.input[0] = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input[0], { type: 'input' });
    });
    getId('vaporizationInputMax').addEventListener('change', () => {
        const input = getId('vaporizationInputMax') as HTMLInputElement;
        player.vaporization.input[1] = Math.max(Number(input.value), 0);
        input.value = format(player.vaporization.input[1], { type: 'input' });
    });
    getId('collapseStarsInput').addEventListener('change', () => {
        const input = getId('collapseStarsInput') as HTMLInputElement;
        let value: string | number = input.value.replace(',', '.');
        let hard = value.includes('!');
        if (hard) { value = value.replace('!', ''); }
        value = Math.max(Number(value), 1);
        if (isNaN(value)) {
            value = 2;
            hard = false;
        }
        player.collapse.input[1] = hard;
        player.collapse.input[0] = value;
        input.value = `${format(value, { type: 'input' })}${hard ? '!' : ''}`;
    });
    getId('stageInput').addEventListener('change', () => {
        const input = getId('stageInput') as HTMLInputElement;
        player.stage.input = Math.max(Number(input.value), 0);
        input.value = format(player.stage.input, { type: 'input' });
    });
    getId('versionButton').addEventListener('click', () => {
        buildVersionInfo();
        getId('versionInfo').style.display = '';
    });
    getId('save').addEventListener('click', () => { void saveGame(); });
    getId('file').addEventListener('change', async() => {
        const id = getId('file') as HTMLInputElement;
        loadGame(await (id.files as FileList)[0].text());
        id.value = '';
    });
    getId('export').addEventListener('click', exportFileGame);
    getId('saveConsole').addEventListener('click', saveConsole);
    if (MD) {
        getId('currentTheme').addEventListener('click', () => getId('themeArea').classList.add('windowOpen'));
        getId('themeArea').addEventListener('mouseleave', () => getId('themeArea').classList.remove('windowOpen'));
    }
    getId('switchTheme0').addEventListener('click', () => setTheme(null));
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`switchTheme${i}`).addEventListener('click', () => setTheme(i));
    }
    getId('toggleAuto8').addEventListener('click', autoElementsSet);
    getId('toggleAuto5').addEventListener('click', () => autoUpgradesSet('all'));
    getId('toggleAuto6').addEventListener('click', () => autoResearchesSet('researches', 'all'));
    getId('toggleAuto7').addEventListener('click', () => autoResearchesSet('researchesExtra', 'all'));
    getId('saveFileNameInput').addEventListener('change', () => {
        const input = getId('saveFileNameInput') as HTMLInputElement;
        const testValue = input.value; //.replaceAll(/[\\/:*?"<>|]/g, '_');
        if (testValue.length < 1) { return void (input.value = playerStart.fileName); }

        try {
            btoa(testValue); //Test for any illegal characters
            player.fileName = testValue;
            //input.value = testValue;
        } catch (error) {
            void Alert(`Save file name is not allowed\n${error}`);
        }
    });
    {
        const button = getId('saveFileHoverButton');
        const hoverFunc = () => (getId('saveFileNamePreview').textContent = replaceSaveFileSpecials());
        button.addEventListener('mouseover', hoverFunc);
        if (SR) { button.addEventListener('focus', hoverFunc); }
    }
    getId('mainInterval').addEventListener('change', () => {
        const mainInput = getId('mainInterval') as HTMLInputElement;
        globalSave.intervals.main = Math.min(Math.max(Math.trunc(Number(mainInput.value)), 20), 100);
        mainInput.value = `${globalSave.intervals.main}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('numbersInterval').addEventListener('change', () => {
        const numberInput = getId('numbersInterval') as HTMLInputElement;
        globalSave.intervals.numbers = Math.min(Math.max(Math.trunc(Number(numberInput.value)), 40), 200);
        numberInput.value = `${globalSave.intervals.numbers}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('visualInterval').addEventListener('change', () => {
        const visualInput = getId('visualInterval') as HTMLInputElement;
        globalSave.intervals.visual = Math.min(Math.max(Math.trunc(Number(visualInput.value) * 100), 20), 400) * 10;
        visualInput.value = `${globalSave.intervals.visual / 1000}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('autoSaveInterval').addEventListener('change', () => {
        const autoSaveInput = getId('autoSaveInterval') as HTMLInputElement;
        globalSave.intervals.autoSave = Math.min(Math.max(Math.trunc(Number(autoSaveInput.value)), 4), 1800) * 1000;
        autoSaveInput.value = `${globalSave.intervals.autoSave / 1000}`;
        saveGlobalSettings();
        changeIntervals();
    });
    getId('thousandSeparator').addEventListener('change', () => changeFormat(false));
    getId('decimalPoint').addEventListener('change', () => changeFormat(true));
    getId('MDToggle0').addEventListener('click', () => toggleSpecial(0, 'mobile', true, true));
    getId('SRToggle0').addEventListener('click', () => toggleSpecial(0, 'reader', true, true));
    getId('pauseGame').addEventListener('click', pauseGame);
    getId('reviewEvents').addEventListener('click', replayEvent);
    getId('offlineWarp').addEventListener('click', timeWarp);
    getId('customFontSize').addEventListener('change', () => changeFontSize(true));

    getId('stageResetsSave').addEventListener('change', () => {
        const inputID = getId('stageResetsSave') as HTMLInputElement;
        player.history.stage.input[0] = Math.min(Math.max(Math.trunc(Number(inputID.value)), 0), 100);
        inputID.value = `${player.history.stage.input[0]}`;
    });
    getId('stageResetsShow').addEventListener('change', () => {
        const input = getId('stageResetsShow') as HTMLInputElement;
        player.history.stage.input[1] = Math.min(Math.max(Math.trunc(Number(input.value)), 4), 100);
        input.value = `${player.history.stage.input[1]}`;
        global.debug.historyStage = -1;
        visualUpdate();
    });

    /* Footer */
    {
        const toggle = getId('hideToggle');
        if (MD) {
            const timeoutFunc = () => {
                if (!global.footer) { return hideFooter(); }
                if (global.intervalsId.mouseRepeat !== undefined) { return; }
                global.intervalsId.mouseRepeat = setTimeout(hideFooter, 400);
            };
            toggle.addEventListener('touchstart', timeoutFunc);
            if (PC) { toggle.addEventListener('mousedown', timeoutFunc); }
        } else { toggle.addEventListener('click', hideFooter); }
    }
    for (const tabText of global.tabList.tabs) {
        getId(`${tabText}TabBtn`).addEventListener('click', () => switchTab(tabText));
        const tabList = global.tabList[`${tabText as 'stage'}Subtabs`] as string[] | undefined;
        if (tabList === undefined) { continue; }
        for (const subtabText of tabList) {
            getId(`${tabText}SubtabBtn${subtabText}`).addEventListener('click', () => switchTab(tabText, subtabText));
        }
    }
    for (let i = 1; i < global.stageInfo.word.length; i++) {
        getId(`${global.stageInfo.word[i]}Switch`).addEventListener('click', () => switchStage(i));
    }

    /* Post */
    stageUpdate('reload');
    document.head.append(document.createComment(' Rarely used CSS rules '), specialHTML.styleSheet);
    getId('body').style.display = '';
    getId('loading').style.display = 'none';
    global.paused = false;
    changeIntervals();
    document.title = `Fundamental ${playerStart.version}`;
    if (globalSave.theme !== null) { setTheme(globalSave.theme, true); }
    void Alert(alertText + `\n(Game loaded after ${format((Date.now() - playerStart.time.started) / 1000, { type: 'time', padding: false })})`);
} catch (error) {
    const stack = (error as { stack: string }).stack;
    void Alert(`Game failed to load\n${typeof stack === 'string' ? stack.replaceAll(`${window.location.origin}/`, '') : error}`);
    const buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = '<button type="button" id="exportError" style="width: 7em;">Export save</button><button type="button" id="deleteError" style="width: 7em;">Delete save</button>';
    buttonDiv.style.cssText = 'display: flex; column-gap: 0.6em; margin-top: 0.4em;';
    getId('loading').append(buttonDiv);
    let exported = false;
    getId('exportError').addEventListener('click', () => {
        exported = true;
        const save = localStorage.getItem('testing_save');
        if (save === null) { return void Alert('No save file detected'); }
        const a = document.createElement('a');
        a.href = `data:text/plain,${save}`;
        a.download = 'Fundamental post error export';
        a.click();
    });
    getId('deleteError').addEventListener('click', async() => {
        if (!exported && !await Confirm("Recommended to export save file first\nPress 'Confirm' to confirm and delete your save file")) { return; }
        localStorage.removeItem('testing_save');
        window.location.reload();
        void Alert('Awaiting game reload');
    });
    throw error;
}
