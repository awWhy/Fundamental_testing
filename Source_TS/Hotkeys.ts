import { global, player } from './Player';
import { checkTab } from './Check';
import { numbersUpdate, switchTab } from './Update';
import { buyBuilding, collapseResetUser, dischargeResetUser, endResetUser, enterExitChallengeUser, mergeResetUser, rankResetUser, stageResetUser, switchStage, toggleSupervoid, toggleSwap, vaporizationResetUser } from './Stage';
import { buyAll, pauseGameUser } from './Main';
import { Notify, globalSave, specialHTML } from './Special';
import type { hotkeysList, numbersList } from './Types';

const hotkeys = {} as Record<string, hotkeysList | numbersList>;
const basicFunctions = {
    makeAll: () => buyAll(),
    stage: (repeat) => {
        if (repeat && (player.inflation.vacuum || player.stage.active >= 4)) { return; }
        void stageResetUser();
    },
    discharge: () => void dischargeResetUser(),
    vaporization: (repeat) => {
        if (repeat) { return; }
        void vaporizationResetUser();
    },
    rank: () => void rankResetUser(),
    collapse: (repeat) => {
        if (repeat) { return; }
        void collapseResetUser();
    },
    galaxy: () => buyBuilding(3, 5),
    pause: (repeat) => {
        if (repeat) { return; }
        pauseGameUser();
    },
    toggleAll: (repeat) => {
        if (repeat) { return; }
        toggleSwap(0, 'buildings', true);
    },
    merge: (repeat) => {
        if (repeat) { return; }
        void mergeResetUser();
    },
    universe: () => buyBuilding(1, 6),
    end: () => void endResetUser(),
    supervoid: (repeat) => {
        if (repeat) { return; }
        const old = player.challenges.super;
        toggleSupervoid(true);
        if (old !== player.challenges.super) { Notify(`Toggled into the ${player.challenges.super ? 'Supervoid' : 'Void'}`); }
    },
    exitChallenge: (repeat) => {
        if (repeat) { return; }
        enterExitChallengeUser(null);
    },
    tabRight: (repeat) => {
        if (repeat) { return; }
        changeTab('right');
    },
    tabLeft: (repeat) => {
        if (repeat) { return; }
        changeTab('left');
    },
    subtabUp: (repeat) => {
        if (repeat) { return; }
        changeSubtab('up');
    },
    subtabDown: (repeat) => {
        if (repeat) { return; }
        changeSubtab('down');
    },
    stageRight: (repeat) => {
        if (repeat) { return; }
        changeStage('right');
    },
    stageLeft: (repeat) => {
        if (repeat) { return; }
        changeStage('left');
    }
} as Record<hotkeysList, (repeat: boolean) => void>;
const numberFunctions = {
    makeStructure: (number) => {
        if (number !== 0) {
            buyBuilding(number, player.stage.active);
        } else { buyAll(); }
    },
    toggleStructure: (number, repeat) => {
        if (repeat) { return; }
        toggleSwap(number, 'buildings', true);
    },
    enterChallenge: (number, repeat) => {
        if (repeat) { return; }
        if (number !== 0) {
            enterExitChallengeUser(number - 1);
        } else { enterExitChallengeUser(null); }
    }
} as Record<numbersList, (number: number, repeat: boolean) => void>;

/** Will remove identical hotkeys from globalSave */
export const assignHotkeys = () => {
    for (const key in hotkeys) { delete hotkeys[key]; } //Don't know better way for now
    const index = globalSave.toggles[0] ? 0 : 1;
    for (const key in globalSave.hotkeys) {
        const hotkey = globalSave.hotkeys[key as hotkeysList][index];
        if (hotkey === 'None') { continue; }
        if (hotkeys[hotkey] !== undefined) {
            globalSave.hotkeys[key as hotkeysList] = ['None', 'None'];
        } else { hotkeys[hotkey] = key as hotkeysList; }
    }
    for (const key in globalSave.numbers) {
        const hotkey = globalSave.numbers[key as numbersList];
        if (hotkey === 'None') { continue; }
        if (hotkeys[hotkey] !== undefined) {
            globalSave.numbers[key as numbersList] = 'None';
        } else { hotkeys[hotkey] = key as numbersList; }
    }
};

/** Removes hotkey if exist, returns name of removed hotkey */
export const removeHotkey = (remove: string, number = false): string | null => {
    const test = hotkeys[remove];
    if (test === undefined) { return null; }
    if (number) {
        globalSave.numbers[test as numbersList] = 'None';
    } else {
        globalSave.hotkeys[test as hotkeysList] = ['None', 'None'];
    }
    return test;
};

/** Returns true if only Shift is holded, false if nothing is holded, null if any of Ctrl/Alt/Meta is holded */
export const detectShift = (check: KeyboardEvent): boolean | null => {
    if (check.metaKey || check.ctrlKey || check.altKey) { return null; }
    return check.shiftKey;
};

export const detectHotkey = (check: KeyboardEvent) => {
    const { key, code } = check;
    const info = global.hotkeys;
    if (check.shiftKey && !info.shift) {
        info.shift = true;
        numbersUpdate();
    }
    if (check.ctrlKey && !info.ctrl) {
        info.ctrl = true;
        numbersUpdate();
    }
    if (code === 'Tab' || code === 'Enter' || code === 'Space') {
        if (detectShift(check) === null) { return; }
        if (code === 'Tab') { info.last = 'Tab'; }
        document.body.classList.remove('noFocusOutline');
        return;
    } else {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType === 'text' || activeType === 'number') { return; }
        document.body.classList.add('noFocusOutline');
    }
    if (info.disabled) { return; }

    if (code === 'Escape') {
        if (detectShift(check) !== false || specialHTML.alert[0] !== null || specialHTML.bigWindow !== null) { return; }
        const notification = specialHTML.notifications[0];
        if (notification !== undefined) { notification[1](true); }
        return;
    } else if (check.metaKey) { return; }

    let name = check.ctrlKey ? 'Ctrl ' : '';
    if (check.shiftKey) { name += 'Shift '; }
    if (check.altKey) { name += 'Alt '; }
    const numberKey = Number(code.replace('Digit', '').replace('Numpad', ''));
    if (!isNaN(numberKey) && code !== '') {
        name += code.includes('Numpad') ? 'Numpad' : 'Numbers';
        const functionTest = numberFunctions[hotkeys[name] as numbersList];
        if (functionTest !== undefined) {
            functionTest(numberKey, info.last === name);
            check.preventDefault();
            info.last = name;
        }
    } else {
        name += globalSave.toggles[0] ?
            (key.length === 1 ? key.toUpperCase() : key.replaceAll(/([A-Z]+)/g, ' $1').trimStart()) :
            (key.length === 1 ? code.replace('Key', '') : code.replaceAll(/([A-Z]+)/g, ' $1').trimStart());
        const functionTest = basicFunctions[hotkeys[name] as hotkeysList];
        if (functionTest !== undefined) {
            functionTest(info.last === name);
            check.preventDefault();
            info.last = name;
        }
    }
};

const changeTab = (direction: 'left' | 'right') => {
    const tabs = global.tabs.list;
    let index = tabs.indexOf(global.tabs.current);

    if (direction === 'left') {
        do {
            if (index <= 0) {
                index = tabs.length - 1;
            } else { index--; }
        } while (!checkTab(tabs[index]));
    } else {
        do {
            if (index >= tabs.length - 1) {
                index = 0;
            } else { index++; }
        } while (!checkTab(tabs[index]));
    }
    switchTab(tabs[index]);
};

/** Through a hotkey */
export const changeSubtab = (direction: 'down' | 'up') => {
    const tab = global.tabs.current;
    const subtabs = global.tabs[tab].list;
    if (subtabs.length < 2) { return; } //Required
    let index = subtabs.indexOf(global.tabs[tab].current);

    if (direction === 'down') {
        do {
            if (index <= 0) {
                index = subtabs.length - 1;
            } else { index--; }
        } while (!checkTab(tab, subtabs[index]));
    } else {
        do {
            if (index >= subtabs.length - 1) {
                index = 0;
            } else { index++; }
        } while (!checkTab(tab, subtabs[index]));
    }
    switchTab(tab, subtabs[index]);
};

const changeStage = (direction: 'left' | 'right') => {
    const activeAll = global.stageInfo.activeAll;
    if (activeAll.length === 1) { return; }
    let index = activeAll.indexOf(player.stage.active);

    if (direction === 'left') {
        if (index <= 0) {
            index = activeAll.length - 1;
        } else { index--; }
    } else {
        if (index >= activeAll.length - 1) {
            index = 0;
        } else { index++; }
    }
    switchStage(activeAll[index]);
};

/* preventDefault should not be used here */
export const handleTouchHotkeys = (event: TouchEvent) => {
    const horizontal = event.changedTouches[0].clientX - specialHTML.mobileDevice.start[0];
    const vertical = event.changedTouches[0].clientY - specialHTML.mobileDevice.start[1];

    const horizontalAbs = Math.abs(horizontal);
    if (horizontalAbs < 100) { return; }
    if (Math.abs(vertical) >= 100) {
        changeSubtab(vertical > 0 ? 'up' : 'down');
    } else if (horizontalAbs >= 250) {
        changeStage(horizontal > 0 ? 'left' : 'right');
    } else {
        changeTab(horizontal > 0 ? 'left' : 'right');
    }
};
