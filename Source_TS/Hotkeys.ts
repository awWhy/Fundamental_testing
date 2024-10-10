import { global, player } from './Player';
import { checkTab } from './Check';
import { switchTab } from './Update';
import { buyBuilding, collapseResetUser, dischargeResetUser, mergeResetUser, rankResetUser, stageResetUser, switchStage, toggleSwap, vaporizationResetUser } from './Stage';
import { buyAll, pauseGame } from './Main';
import { globalSave } from './Special';

export const detectHotkey = (check: KeyboardEvent) => {
    if (check.code === 'Tab') {
        document.body.classList.remove('noFocusOutline');
        return;
    } else {
        const activeType = (document.activeElement as HTMLInputElement)?.type;
        if (activeType === 'text' || activeType === 'number') { return; }
        document.body.classList.add('noFocusOutline');
    }
    const { key, code } = check;
    let { shiftKey } = check;

    //Can be undefined on Safari
    if (shiftKey) { global.hotkeys.shift = true; }
    if (check.ctrlKey) { return void (global.hotkeys.ctrl = true); }
    if (check.altKey) { return; }

    const numberKey = Number(code.slice(-1));
    if (!isNaN(numberKey)) {
        if (isNaN(Number(key))) {
            if (code === '' || code[0] === 'F') { return; }
            if (!shiftKey) { //Numpad
                shiftKey = true;
                check.preventDefault();
            }
        }

        if (shiftKey) {
            if (check.repeat) { return; }
            toggleSwap(numberKey, 'buildings', true);
        } else { buyBuilding(numberKey); }
    } else if (key.length === 1) {
        const stringKey = (globalSave.toggles[0] ? key : code.replace('Key', '')).toLowerCase();
        if (shiftKey) {
            if (stringKey === 'a') {
                if (check.repeat) { return; }
                toggleSwap(0, 'buildings', true);
            } else if (stringKey === 'm') {
                if (check.repeat) { return; }
                void mergeResetUser();
            } else if (stringKey === 'u') {
                buyBuilding(1, 6);
            }
        } else {
            if (stringKey === 'm') {
                buyAll();
            } else if (stringKey === 's') {
                if (check.repeat && (player.inflation.vacuum || player.stage.active >= 4)) { return; }
                void stageResetUser();
            } else if (stringKey === 'd') {
                void dischargeResetUser();
            } else if (stringKey === 'v') {
                if (check.repeat) { return; }
                void vaporizationResetUser();
            } else if (stringKey === 'r') {
                void rankResetUser();
            } else if (stringKey === 'c') {
                if (check.repeat) { return; }
                void collapseResetUser();
            } else if (stringKey === 'g') {
                buyBuilding(3, 5);
            } else if (stringKey === 'p') {
                if (check.repeat || !globalSave.developerMode) { return; }
                void pauseGame();
            }
        }
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        if (check.repeat) { return; }
        if (shiftKey) {
            const activeAll = global.stageInfo.activeAll;
            if (activeAll.length === 1) { return; }
            let index = activeAll.indexOf(player.stage.active);

            if (key === 'ArrowLeft') {
                if (index <= 0) {
                    index = activeAll.length - 1;
                } else { index--; }
                switchStage(activeAll[index]);
            } else {
                if (index >= activeAll.length - 1) {
                    index = 0;
                } else { index++; }
                switchStage(activeAll[index]);
            }
        } else {
            const tabs = global.tabList.tabs;
            let index = tabs.indexOf(global.tab);

            if (key === 'ArrowLeft') {
                do {
                    if (index <= 0) {
                        index = tabs.length - 1;
                    } else { index--; }
                } while (!checkTab(tabs[index]));
                switchTab(tabs[index]);
            } else {
                do {
                    if (index >= tabs.length - 1) {
                        index = 0;
                    } else { index++; }
                } while (!checkTab(tabs[index]));
                switchTab(tabs[index]);
            }
        }
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        if (shiftKey || check.repeat) { return; }
        const tab = global.tab;
        const subtabs = global.tabList[`${tab}Subtabs`] as string[];
        if (subtabs.length < 2) { return; } //To remove never[]
        let index = subtabs.indexOf(global.subtab[`${tab}Current`]);

        if (key === 'ArrowDown') {
            do {
                if (index <= 0) {
                    index = subtabs.length - 1;
                } else { index--; }
            } while (!checkTab(tab, subtabs[index]));
            switchTab(tab, subtabs[index]);
        } else {
            do {
                if (index >= subtabs.length - 1) {
                    index = 0;
                } else { index++; }
            } while (!checkTab(tab, subtabs[index]));
            switchTab(tab, subtabs[index]);
        }
    }
};
