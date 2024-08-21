import { changeIntervals, getId, getQuery } from './Main';
import { global, player } from './Player';
import type { globalSaveType } from './Types';
import { format, numbersUpdate, visualUpdate } from './Update';

export const globalSave: globalSaveType = {
    intervals: {
        main: 20,
        numbers: 80,
        visual: 1000,
        autoSave: 20000
    },
    toggles: [false, false, false],
    //Hotkeys type[0]; Elements as tab[1]; Allow text selection[2]
    format: ['.', ''], //Point[0]; Separator[1]
    theme: null,
    fontSize: 16,
    MDSettings: [false, false], //Status[0]; Mouse events[1]
    SRSettings: [false, false, false], //Status[0]; Tabindex Upgrades[1]; Tabindex primary[2]
    developerMode: false
};

export const saveGlobalSettings = () => localStorage.setItem('fundamentalSettings', btoa(JSON.stringify(globalSave)));

export const toggleSpecial = (number: number, type: 'global' | 'mobile' | 'reader', change = false, reload = false) => {
    let toggles;
    if (type === 'mobile') {
        toggles = globalSave.MDSettings;
    } else if (type === 'reader') {
        toggles = globalSave.SRSettings;
    } else {
        toggles = globalSave.toggles;
    }

    if (change) {
        if (reload) {
            return void (async() => {
                if (!await Confirm('Changing this setting will reload game, confirm?\n(Game will not autosave)')) { return; }
                global.paused = true;
                changeIntervals();
                toggles[number] = !toggles[number];
                saveGlobalSettings();
                window.location.reload();
                return void Alert('Awaiting game reload');
            })();
        } else {
            toggles[number] = !toggles[number];
            saveGlobalSettings();
        }
    }

    let toggleHTML;
    if (type === 'mobile') {
        toggleHTML = getId(`MDToggle${number}`);
    } else if (type === 'reader') {
        toggleHTML = getId(`SRToggle${number}`);
    } else {
        toggleHTML = getId(`globalToggle${number}`);
    }

    if (!toggles[number]) {
        toggleHTML.style.color = '';
        toggleHTML.style.borderColor = '';
        toggleHTML.textContent = 'OFF';
    } else {
        toggleHTML.style.color = 'var(--red-text)';
        toggleHTML.style.borderColor = 'crimson';
        toggleHTML.textContent = 'ON';
    }
};

export const specialHTML = { //Images here are from true vacuum for easier cache
    resetHTML: ['', 'Discharge', 'Vaporization', 'Rank', 'Collapse', 'Merge'], //[0] === textContent
    longestBuilding: 7, //+1
    buildingHTML: [ //outerHTML is slow
        [],
        ['Preon.png', 'Quarks.png', 'Particle.png', 'Atom.png', 'Molecule.png'], //[0] === src
        ['Drop.png', 'Puddle.png', 'Pond.png', 'Lake.png', 'Sea.png', 'Ocean.png'],
        ['Cosmic%20dust.png', 'Planetesimal.png', 'Protoplanet.png', 'Natural%20satellite.png', 'Subsatellite.png'],
        ['Brown%20dwarf.png', 'Orange%20dwarf.png', 'Red%20supergiant.png', 'Blue%20hypergiant.png', 'Quasi%20star.png'],
        ['Nebula.png', 'Star%20cluster.png', 'Galaxy.png'],
        ['Missing.png'] //Universe
    ],
    longestUpgrade: 13,
    upgradeHTML: [
        [], [
            'UpgradeQ1.png',
            'UpgradeQ2.png',
            'UpgradeQ3.png',
            'UpgradeQ4.png',
            'UpgradeQ5.png',
            'UpgradeQ6.png',
            'UpgradeQ7.png',
            'UpgradeQ8.png',
            'UpgradeQ9.png',
            'UpgradeQ10.png'
        ], [
            'UpgradeW1.png',
            'UpgradeW2.png',
            'UpgradeW3.png',
            'UpgradeW4.png',
            'UpgradeW5.png',
            'UpgradeW6.png',
            'UpgradeW7.png',
            'UpgradeW8.png',
            'UpgradeW9.png'
        ], [
            'UpgradeA1.png',
            'UpgradeA2.png',
            'UpgradeA3.png',
            'UpgradeA4.png',
            'UpgradeA5.png',
            'UpgradeA6.png',
            'UpgradeA7.png',
            'UpgradeA8.png',
            'UpgradeA9.png',
            'UpgradeA10.png',
            'UpgradeA11.png',
            'UpgradeA12.png',
            'UpgradeA13.png'
        ], [
            'UpgradeS1.png',
            'UpgradeS2.png',
            'UpgradeS3.png',
            'UpgradeS4.png',
            'UpgradeS5.png'
        ], [
            'UpgradeG1.png',
            'UpgradeG2.png',
            'UpgradeG3.png',
            'Missing.png' //'UpgradeG4.png'
        ], []
    ],
    longestResearch: 9,
    researchHTML: [
        [], [
            ['ResearchQ1.png', 'stage1borderImage'], //[1] === className
            ['ResearchQ2.png', 'stage1borderImage'],
            ['ResearchQ3.png', 'stage1borderImage'],
            ['ResearchQ4.png', 'stage4borderImage'],
            ['ResearchQ5.png', 'stage4borderImage'],
            ['ResearchQ6.png', 'stage4borderImage']
        ], [
            ['ResearchW1.png', 'stage2borderImage'],
            ['ResearchW2.png', 'stage2borderImage'],
            ['ResearchW3.png', 'stage2borderImage'],
            ['ResearchW4.png', 'stage2borderImage'],
            ['ResearchW5.png', 'stage2borderImage'],
            ['ResearchW6.png', 'stage2borderImage']
        ], [
            ['ResearchA1.png', 'stage3borderImage'],
            ['ResearchA2.png', 'stage2borderImage'],
            ['ResearchA3.png', 'stage3borderImage'],
            ['ResearchA4.png', 'stage3borderImage'],
            ['ResearchA5.png', 'stage3borderImage'],
            ['ResearchA6.png', 'stage3borderImage'],
            ['ResearchA7.png', 'stage1borderImage'],
            ['ResearchA8.png', 'stage7borderImage'],
            ['ResearchA9.png', 'stage1borderImage']
        ], [
            ['ResearchS1.png', 'stage5borderImage'],
            ['ResearchS2.png', 'stage5borderImage'],
            ['ResearchS3.png', 'stage7borderImage'],
            ['ResearchS4.png', 'stage5borderImage'],
            ['ResearchS5.png', 'stage6borderImage'],
            ['Missing.png', 'stage7borderImage'] //['ResearchS5.png', 'stage6borderImage']
        ], [
            ['ResearchG1.png', 'stage1borderImage'],
            ['ResearchG2.png', 'stage6borderImage']
        ], []
    ],
    longestResearchExtra: 5,
    researchExtraDivHTML: [
        [],
        ['Energy%20Researches.png', 'stage4borderImage'],
        ['Cloud%20Researches.png', 'stage2borderImage'],
        ['Rank%20Researches.png', 'stage6borderImage'],
        ['Collapse%20Researches.png', 'stage6borderImage'],
        ['Galaxy%20Researches.png', 'stage3borderImage'],
        ['Missing.png', 'stage7borderImage']
    ],
    researchExtraHTML: [
        [], [
            ['ResearchEnergy1.png', 'stage1borderImage'],
            ['ResearchEnergy2.png', 'stage5borderImage'],
            ['ResearchEnergy3.png', 'stage3borderImage'],
            ['ResearchEnergy4.png', 'stage1borderImage'],
            ['ResearchEnergy5.png', 'stage6borderImage']
        ], [
            ['ResearchClouds1.png', 'stage3borderImage'],
            ['ResearchClouds2.png', 'stage2borderImage'],
            ['ResearchClouds3.png', 'stage4borderImage'],
            ['ResearchClouds4.png', 'stage2borderImage']
        ], [
            ['ResearchRank1.png', 'stage3borderImage'],
            ['ResearchRank2.png', 'stage3borderImage'],
            ['ResearchRank3.png', 'stage3borderImage'],
            ['ResearchRank4.png', 'stage2borderImage'],
            ['ResearchRank5.png', 'stage2borderImage']
        ], [
            ['ResearchCollapse1.png', 'stage6borderImage'],
            ['ResearchCollapse2.png', 'stage7borderImage'],
            ['ResearchCollapse3.png', 'stage1borderImage'],
            ['Missing.png', 'stage7borderImage'] //['ResearchCollapse4.png', 'stage1borderImage']
        ], [
            ['ResearchGalaxy1.png', 'stage3borderImage']
        ], []
    ],
    longestFooterStats: 3,
    footerStatsHTML: [
        [], [
            ['Energy%20mass.png', 'stage1borderImage cyanText', 'Mass'], //[2] === textcontent
            ['Energy.png', 'stage4borderImage orangeText', 'Energy']
        ], [
            ['Water.png', 'stage2borderImage blueText', 'Moles'],
            ['Drop.png', 'stage2borderImage blueText', 'Drops'],
            ['Clouds.png', 'stage3borderImage grayText', 'Clouds']
        ], [
            ['Mass.png', 'stage3borderImage grayText', 'Mass']
        ], [
            ['Main_sequence%20mass.png', 'stage1borderImage cyanText', 'Mass'],
            ['Elements.png', 'stage4borderImage orangeText', 'Elements']
        ], [
            ['Main_sequence%20mass.png', 'stage1borderImage cyanText', 'Mass'],
            ['Elements.png', 'stage4borderImage orangeText', 'Elements'],
            ['Stars.png', 'stage7borderImage redText', 'Stars']
        ], [
            ['Missing.png', 'stage7borderImage redText', 'Missing'],
            ['Missing.png', 'stage7borderImage redText', 'Cosmon']
        ]
    ],
    cache: {
        imagesDiv: document.createElement('div'),
        idMap: new Map<string, HTMLElement>(),
        classMap: new Map<string, HTMLCollectionOf<HTMLElement>>(),
        queryMap: new Map<string, HTMLElement>()
    },
    notifications: [] as Array<[string, () => void]>,
    alert: [null, null] as [number | null, (() => void) | null],
    styleSheet: document.createElement('style') //Secondary
};

export const preventImageUnload = () => {
    const { footerStatsHTML: footer, buildingHTML: build, upgradeHTML: upgrade, researchHTML: research, researchExtraHTML: extra, researchExtraDivHTML: extraDiv } = specialHTML;
    //Duplicates are ignored, unless they are from Strangeness, because duplicates from there could become unique in future

    let images = '<img src="Used_art/Red%20giant.png" loading="lazy"><img src="Used_art/White%20dwarf.png" loading="lazy">';
    images += '<img src="Used_art/Neutron%20star.png" loading="lazy"><img src="Used_art/Missing.png" loading="lazy">'; //Quark%20star.png
    for (let s = 1; s <= 6; s++) { //6
        for (let i = 0; i < footer[s].length; i++) {
            if (s === 2) {
                if (i === 2) { continue; } //Drops
            } else if (s === 5 && i < 2) { continue; } //Solar mass and Elements
            images += `<img src="Used_art/${footer[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < build[s].length; i++) {
            images += `<img src="Used_art/${build[s][i]}" loading="lazy">`;
        }
        for (let i = 0; i < upgrade[s].length; i++) {
            images += `<img src="Used_art/${upgrade[s][i]}" loading="lazy">`;
        }
        for (let i = 0; i < research[s].length; i++) {
            images += `<img src="Used_art/${research[s][i][0]}" loading="lazy">`;
        }
        for (let i = 0; i < extra[s].length; i++) {
            images += `<img src="Used_art/${extra[s][i][0]}" loading="lazy">`;
        }
        images += `<img src="Used_art/${extraDiv[s][0]}" loading="lazy">`;
        images += `<img src="Used_art/Stage${s}%20border.png" loading="lazy">`;
    }
    specialHTML.cache.imagesDiv.innerHTML = images; //Saved just in case
};

export const setTheme = (theme: number | null, noSwitch = false) => {
    if (theme !== null) {
        if (player.stage.true < theme) { theme = null; }
        if (theme === 6 && player.stage.true < 7) { theme = null; }
        if (noSwitch && theme !== null) { return; }
    }

    globalSave.theme = theme;
    saveGlobalSettings();
    if (!noSwitch) { switchTheme(); }
};

export const switchTheme = () => {
    const body = document.body.style;
    const theme = globalSave.theme ?? player.stage.active;
    getId('currentTheme').textContent = globalSave.theme === null ? 'Default' : global.stageInfo.word[theme];

    let dropStatColor = '';
    let waterStatColor = '';
    body.setProperty('--transition-all', '1s');
    body.setProperty('--transition-buttons', '700ms');

    /* Full reset, because better response from CSS (also easier) */
    body.removeProperty('--background-color');
    body.removeProperty('--window-color');
    body.removeProperty('--window-border');
    body.removeProperty('--footer-color');
    body.removeProperty('--button-color');
    body.removeProperty('--button-border');
    body.removeProperty('--button-hover');
    body.removeProperty('--building-afford');
    body.removeProperty('--tab-active');
    body.removeProperty('--tab-elements');
    body.removeProperty('--tab-strangeness');
    body.removeProperty('--hollow-hover');
    body.removeProperty('--footerButton-hover');
    body.removeProperty('--input-border');
    body.removeProperty('--input-text');
    body.removeProperty('--button-text');
    body.removeProperty('--main-text');
    body.removeProperty('--white-text');
    //body.removeProperty('--cyan-text');
    body.removeProperty('--blue-text');
    body.removeProperty('--orange-text');
    body.removeProperty('--gray-text');
    body.removeProperty('--orchid-text');
    body.removeProperty('--darkorchid-text');
    body.removeProperty('--darkviolet-text');
    body.removeProperty('--red-text');
    body.removeProperty('--green-text');
    body.removeProperty('--yellow-text');
    /* These colors will need to be changed in other places as well: (not just 2)
        --window-color > '.stage2windowBackground';
        --button-border > '.stage2borderButton' and 'global.stageInfo.buttonBorder[2]'; */
    switch (theme) {
        case 1:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = '';
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = '';
            }
            break;
        case 2:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--white-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            body.setProperty('--background-color', '#070026');
            body.setProperty('--window-color', '#000052');
            body.setProperty('--window-border', 'blue');
            body.setProperty('--footer-color', '#0000db');
            body.setProperty('--button-color', '#0000eb');
            body.setProperty('--button-border', '#386cc7');
            body.setProperty('--button-hover', '#2929ff');
            body.setProperty('--building-afford', '#b30000');
            body.setProperty('--tab-active', '#990000');
            body.setProperty('--hollow-hover', '#2400d7');
            body.setProperty('--input-border', '#4747ff');
            body.setProperty('--input-text', 'dodgerblue');
            body.setProperty('--main-text', 'var(--blue-text)');
            body.setProperty('--gray-text', '#9b9b9b');
            body.setProperty('--darkorchid-text', '#c71bff');
            body.setProperty('--darkviolet-text', '#8b6bff');
            body.setProperty('--green-text', '#82cb3b');
            body.setProperty('--red-text', '#f70000');
            if (player.stage.active === 2) {
                dropStatColor = '#3099ff';
                waterStatColor = '#3099ff';
            }
            break;
        case 3:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = 'var(--green-text)';
            }
            body.setProperty('--background-color', '#000804');
            body.setProperty('--window-color', '#2e1200');
            body.setProperty('--window-border', '#31373e');
            body.setProperty('--footer-color', '#221a00');
            body.setProperty('--button-color', '#291344');
            body.setProperty('--button-border', '#424242');
            body.setProperty('--button-hover', '#382055');
            body.setProperty('--building-afford', '#9e0000');
            body.setProperty('--tab-active', '#8d4c00');
            body.setProperty('--tab-elements', 'var(--tab-active)');
            body.setProperty('--hollow-hover', '#5a2100');
            body.setProperty('--footerButton-hover', '#1a1a1a');
            body.setProperty('--input-border', '#8b4a00');
            body.setProperty('--input-text', '#e77e00');
            body.setProperty('--main-text', 'var(--gray-text)');
            body.setProperty('--white-text', '#dfdfdf');
            body.setProperty('--orange-text', '#f58600');
            body.setProperty('--green-text', '#00db00');
            if (player.stage.active === 2) {
                dropStatColor = '#3099ff';
                waterStatColor = '#3099ff';
            }
            break;
        case 4:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--blue-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            body.setProperty('--background-color', '#140e04');
            body.setProperty('--window-color', '#4e0000');
            body.setProperty('--window-border', '#894800');
            body.setProperty('--footer-color', '#4e0505');
            body.setProperty('--button-color', '#6a3700');
            body.setProperty('--button-border', '#a35700');
            body.setProperty('--button-hover', '#8a4700');
            body.setProperty('--building-afford', '#007f95');
            body.setProperty('--tab-active', '#008297');
            body.setProperty('--tab-elements', 'var(--tab-active)');
            body.setProperty('--tab-strangeness', '#00a500');
            body.setProperty('--hollow-hover', '#605100');
            body.setProperty('--footerButton-hover', '#212121');
            body.setProperty('--input-border', '#008399');
            body.setProperty('--input-text', '#05c3c3');
            body.setProperty('--button-text', '#d9d900');
            body.setProperty('--main-text', 'var(--orange-text)');
            body.setProperty('--white-text', '#e5e500');
            body.setProperty('--blue-text', '#2e96ff');
            body.setProperty('--gray-text', '#8b8b8b');
            body.setProperty('--darkorchid-text', '#c71bff');
            body.setProperty('--darkviolet-text', '#9457ff');
            body.setProperty('--red-text', 'red');
            body.setProperty('--green-text', '#00e600');
            body.setProperty('--yellow-text', 'var(--green-text)');
            break;
        case 5:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--red-text)';
            }
            body.setProperty('--background-color', '#060010');
            body.setProperty('--window-color', '#001d42');
            body.setProperty('--window-border', '#35466e');
            body.setProperty('--footer-color', '#2f005c');
            body.setProperty('--button-color', '#4a008f');
            body.setProperty('--button-border', '#8f004c');
            body.setProperty('--button-hover', '#6800d6');
            body.setProperty('--building-afford', '#8603ff');
            body.setProperty('--tab-active', '#8500ff');
            body.setProperty('--hollow-hover', '#3b0080');
            body.setProperty('--footerButton-hover', '#1a1a1a');
            body.setProperty('--input-border', '#3656a1');
            body.setProperty('--input-text', '#6a88cd');
            body.setProperty('--button-text', '#fc9cfc');
            body.setProperty('--main-text', 'var(--darkorchid-text)');
            body.setProperty('--white-text', '#ff79ff');
            body.setProperty('--orchid-text', '#ff00f4');
            body.setProperty('--darkorchid-text', '#c000ff');
            body.setProperty('--darkviolet-text', '#9f52ff');
            body.setProperty('--yellow-text', 'var(--darkviolet-text)');
            break;
        case 6:
            for (const text of ['upgrade', 'element']) {
                getId(`${text}Text`).style.color = 'var(--orchid-text)';
                getId(`${text}Effect`).style.color = 'var(--red-text)';
                getId(`${text}Cost`).style.color = '';
            }
            body.setProperty('--background-color', 'black');
            body.setProperty('--window-color', '#01003c');
            body.setProperty('--window-border', '#7100ff');
            body.setProperty('--footer-color', '#00007a');
            body.setProperty('--button-color', '#2b0095');
            body.setProperty('--button-border', '#6c1ad1');
            body.setProperty('--button-hover', '#3d00d6');
            body.setProperty('--building-afford', '#b30000');
            body.setProperty('--tab-active', '#8d0000');
            body.setProperty('--hollow-hover', '#490070');
            body.setProperty('--input-border', '#a50000');
            body.setProperty('--input-text', 'red');
            body.setProperty('--button-text', '#efe0ff');
            body.setProperty('--main-text', 'var(--darkviolet-text)');
            body.setProperty('--gray-text', '#9b9b9b');
            body.setProperty('--darkviolet-text', '#8157ff');
            body.setProperty('--white-text', '#f9f5ff');
            body.setProperty('--red-text', 'red');
            body.setProperty('--yellow-text', 'var(--red-text)');
    }
    getQuery('#footerStat1 > p').style.color = dropStatColor;
    getQuery('#footerStat2 > p').style.color = waterStatColor;

    setTimeout(() => {
        body.removeProperty('--transition-all');
        body.removeProperty('--transition-buttons');
    }, 1000);
};

export const Alert = async(text: string, priority = 0): Promise<void> => {
    return await new Promise((resolve) => {
        if (specialHTML.alert[0] !== null) {
            if (specialHTML.alert[0] < priority) {
                (specialHTML.alert[1] as () => undefined)();
                Notify(`Alert has been replaced with higher priority one\nOld text: ${getId('alertText').textContent}`);
            } else {
                resolve();
                Notify(`Another Alert is already active\nMissed text: ${text}`);
                return;
            }
        }

        getId('alertText').textContent = text;
        const body = document.body;
        const blocker = getId('alertMain');
        const confirm = getId('alertConfirm');
        blocker.style.display = '';
        confirm.focus();

        const key = async(button: KeyboardEvent) => {
            if (button.key === 'Escape' || button.key === 'Enter' || button.key === ' ') {
                button.preventDefault();
                close();
            }
        };
        const close = () => {
            blocker.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', close);
            specialHTML.alert = [null, null];
            resolve();
        };
        specialHTML.alert = [priority, close];
        body.addEventListener('keydown', key);
        confirm.addEventListener('click', close);
    });
};

export const Confirm = async(text: string, priority = 0): Promise<boolean> => {
    return await new Promise((resolve) => {
        if (specialHTML.alert[0] !== null) {
            if (specialHTML.alert[0] < priority) {
                (specialHTML.alert[1] as () => undefined)();
                Notify(`Alert has been replaced with higher priority one\nOld text: ${getId('alertText').textContent}`);
            } else {
                resolve(false);
                Notify(`Another Alert is already active\nMissed text: ${text}`);
                return;
            }
        }

        getId('alertText').textContent = text;
        const body = document.body;
        const blocker = getId('alertMain');
        const cancel = getId('alertCancel');
        const confirm = getId('alertConfirm');
        blocker.style.display = '';
        cancel.style.display = '';
        confirm.focus();

        const yes = () => { close(true); };
        const no = () => { close(false); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                button.preventDefault();
                no();
            } else if (button.key === 'Enter' || button.key === ' ') {
                if (document.activeElement === cancel) { return; }
                button.preventDefault();
                yes();
            }
        };
        const close = (result: boolean) => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            specialHTML.alert = [null, null];
            resolve(result);
        };
        specialHTML.alert = [priority, no];
        body.addEventListener('keydown', key);
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
    });
};

export const Prompt = async(text: string, placeholder = '', priority = 0): Promise<string | null> => {
    return await new Promise((resolve) => {
        if (specialHTML.alert[0] !== null) {
            if (specialHTML.alert[0] < priority) {
                (specialHTML.alert[1] as () => undefined)();
                Notify(`Alert has been replaced with higher priority one\nOld text: ${getId('alertText').textContent}`);
            } else {
                resolve(null);
                Notify(`Another Alert is already active\nMissed text: ${text}`);
                return;
            }
        }

        getId('alertText').textContent = text;
        const body = document.body;
        const blocker = getId('alertMain');
        const input = getId('alertInput') as HTMLInputElement;
        const cancel = getId('alertCancel');
        const confirm = getId('alertConfirm');
        blocker.style.display = '';
        cancel.style.display = '';
        input.style.display = '';
        input.placeholder = placeholder;
        input.value = '';
        input.focus();

        const yes = () => { close(input.value === '' ? input.placeholder : input.value); };
        const no = () => { close(null); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                button.preventDefault();
                no();
            } else if (document.activeElement !== cancel) {
                if (button.key === 'Enter') {
                    button.preventDefault();
                    yes();
                } else if (button.key === ' ') {
                    if (document.activeElement === input) { return; }
                    button.preventDefault();
                    yes();
                }
            }
        };
        const close = (result: string | null) => {
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            specialHTML.alert = [null, null];
            resolve(result);
        };
        specialHTML.alert = [priority, no];
        body.addEventListener('keydown', key);
        confirm.addEventListener('click', yes);
        cancel.addEventListener('click', no);
    });
};

export const Notify = (text: string) => {
    /* [0] is for identification; [1] is for html manipulation */
    const { notifications } = specialHTML;

    let index;
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i][0] === text) {
            index = i;
            break;
        }
    }

    if (index === undefined) {
        let count = 1;
        let timeout: number;

        const html = document.createElement('p');
        html.textContent = text;
        html.style.animation = 'hideX 800ms ease-in-out reverse';
        html.style.pointerEvents = 'none';
        if (globalSave.SRSettings[0]) { html.role = 'alert'; }
        getId('notifications').append(html);

        const pointer = notifications[notifications.push([text, () => {
            html.textContent = `${text} | x${++count}`;
            clearTimeout(timeout);
            timeout = setTimeout(remove, 7200);
        }]) - 1];
        const remove = () => {
            notifications.splice(notifications.indexOf(pointer), 1);
            html.removeEventListener('click', remove);
            html.style.animation = 'hideX 800ms ease-in-out forwards';
            html.style.pointerEvents = 'none';
            setTimeout(() => html.remove(), 800);
            clearTimeout(timeout);
        };
        setTimeout(() => {
            html.style.animation = '';
            html.style.pointerEvents = '';
            timeout = setTimeout(remove, 7200);
            html.addEventListener('click', remove);
        }, 800);
    } else { notifications[index][1](); }
};

export const hideFooter = () => {
    const toggleData = getId('hideToggle').dataset;
    if (toggleData.disabled === 'true') { return; }
    const footer = getId('footer');
    const footerArea = getId('footerMain');
    const arrow = getId('hideArrow');

    const animationReset = () => {
        footer.style.animation = '';
        arrow.style.animation = '';
        toggleData.disabled = '';
    };

    global.footer = !global.footer;
    toggleData.disabled = 'true';
    if (global.footer) {
        footerArea.style.display = '';
        arrow.style.transform = '';
        footer.style.animation = 'hideY 800ms reverse';
        arrow.style.animation = 'rotate 800ms reverse';
        getId('hideText').textContent = 'Hide';
        getId('stageSelect').classList.add('active');
        setTimeout(animationReset, 800);

        visualUpdate();
        numbersUpdate();
    } else {
        footer.style.animation = 'hideY 800ms backwards';
        arrow.style.animation = 'rotate 800ms backwards';
        getId('hideText').textContent = 'Show';
        getId('stageSelect').classList.remove('active');
        setTimeout(() => {
            footerArea.style.display = 'none';
            arrow.style.transform = 'rotate(180deg)';
            animationReset();
        }, 800);
    }
};

export const changeFontSize = (initial: boolean) => {
    const input = getId('customFontSize') as HTMLInputElement;
    const size = Math.min(Math.max(initial ? globalSave.fontSize : (input.value === '' ? 16 : Math.floor(Number(input.value) * 100) / 100), 12), 24);
    if (!initial) {
        globalSave.fontSize = size;
        saveGlobalSettings();
    }

    document.documentElement.style.fontSize = size === 16 ? '' : `${size}px`;
    input.value = `${size}`;
    adjustCSSRules(initial);
};
/* Only decent work around media not allowing var() and rem units being bugged */
const adjustCSSRules = (initial: boolean) => {
    const styleSheet = (getId('primaryRules') as HTMLStyleElement).sheet;
    if (styleSheet == null) { //Safari doesn't wait for CSS to load even if script is defered
        if (initial) {
            return getId('primaryRules').addEventListener('load', () => {
                adjustCSSRules(false);
            }, { once: true });
        }
        return Notify(`Due to ${styleSheet} related Error some font size features will not work`);
    }
    const styleLength = styleSheet.cssRules.length - 1;
    const fontRatio = globalSave.fontSize / 16;
    const rule1 = styleSheet.cssRules[styleLength - 1] as CSSMediaRule; //Primary phone size
    const rule2 = styleSheet.cssRules[styleLength] as CSSMediaRule; //Tiny phone size
    styleSheet.deleteRule(styleLength);
    styleSheet.deleteRule(styleLength - 1);
    styleSheet.insertRule(rule1.cssText.replace(rule1.conditionText, `screen and (max-width: ${893 * fontRatio + 32}px)`), styleLength - 1);
    styleSheet.insertRule(rule2.cssText.replace(rule2.conditionText, `screen and (max-width: ${362 * fontRatio + 32}px)`), styleLength);
};

export const changeFormat = (point: boolean) => {
    const htmlInput = (point ? getId('decimalPoint') : getId('thousandSeparator')) as HTMLInputElement;
    const allowed = ['.', '·', ',', ' ', '_', "'", '"', '`', '|'].includes(htmlInput.value);
    if (!allowed || globalSave.format[point ? 1 : 0] === htmlInput.value) {
        if (point && globalSave.format[1] === '.') {
            (getId('thousandSeparator') as HTMLInputElement).value = '';
            globalSave.format[1] = '';
        }
        htmlInput.value = point ? '.' : '';
    }
    globalSave.format[point ? 0 : 1] = htmlInput.value;
    saveGlobalSettings();
};

export const MDStrangenessPage = (stageIndex: number) => {
    for (let s = 1; s <= 5; s++) { getId(`strangenessSection${s}`).style.display = 'none'; }
    getId(`strangenessSection${stageIndex}`).style.display = '';
};

export const replayEvent = async() => {
    let last;
    if (player.stage.true >= 6) {
        last = player.events[1] ? 8 : player.stage.resets >= 1 ? 7 : 6;
    } else {
        last = player.stage.true - (player.events[0] ? 0 : 1);
        if (last < 1) { return void Alert('There are no unlocked events'); }
    }

    let text = 'Which event do you want to see again?\nEvent 1: Stage reset';
    if (last >= 2) { text += '\nEvent 2: Clouds softcap'; }
    if (last >= 3) { text += '\nEvent 3: New Rank'; }
    if (last >= 4) { text += '\nEvent 4: New Elements'; }
    if (last >= 5) { text += '\nEvent 5: Intergalactic'; }
    if (last >= 6) { text += '\nEvent 6: True Vacuum'; }
    if (last >= 7) { text += '\nEvent 7: Void unlocked'; }
    if (last >= 8) { text += '\nEvent 8: New Universe'; }

    const event = Number(await Prompt(text, `${last}`));
    if (event > last) { return; }
    playEvent(event);
};

/** Sets player.events[index] to true if provided */
export const playEvent = (event: number, index = null as number | null) => {
    if (specialHTML.alert[0] !== null) { return Notify(`Missed Event ${event}, you can replay it from options`); }
    if (index !== null) { player.events[index] = true; }

    switch (event) {
        case 1:
            return void Alert('New reset tier has been unlocked. It will allow to reach higher tiers of Structures, but for the price of everything else');
        case 2:
            return void Alert(`Cloud density is too high... Any new Clouds past ${format(1e4)} will be weaker due to softcap`);
        case 3:
            return void Alert("Can't gain any more Mass with current Rank. New one has been unlocked, but reaching it will softcap the Mass production");
        case 4:
            return void Alert('Last explosion not only created first Neutron stars, but also unlocked new Elements through Supernova nucleosynthesis');
        case 5:
            return void Alert("There aren't any Structures in Intergalactic yet, but maybe new ones can be created within previous Stages. Any new Stage resets and exports from now on will award Strange quarks\n(Stars in Intergalactic are just Stars from Interstellar)");
        case 6:
            return void Alert('As Galaxies started to Merge, their combined Gravity pushed Vacuum out of its local minimum into more stable global minimum. New forces and Structures are expected within this new and true Vacuum state');
        case 7:
            return void Alert("With Vacuum decaying remaining matter had rearranged itself in such way that lead to the formation of the 'Void'. Check it out in 'Advanced' subtab");
        case 8:
            return void Alert("There is now enough matter to create the 'Universe', it can be done within new 'Abyss' Stage. Creating it will do a Vacuum reset, while also resetting Vacuum state back to false");
    }
};
