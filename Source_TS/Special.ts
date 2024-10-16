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
                void Alert('Awaiting game reload');
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
        ['Universe.png']
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
            'Missing.png'
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
            ['Missing.png', 'stage4borderImage']
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
            ['Missing.png', 'stage5borderImage']
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
            ['Missing.png', 'stage3borderImage grayText', 'Matter'], //'Dark%20matter.png'
            ['Missing.png', 'stage6borderImage darkvioletText', 'Cosmon']
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

export const setTheme = (theme: number | null) => {
    if (theme !== null) {
        if (player.stage.true < theme) { theme = null; }
        if (theme === 6 && player.stage.true < 7) { theme = null; }
    }

    globalSave.theme = theme;
    saveGlobalSettings();
    switchTheme();
    getId('currentTheme').textContent = globalSave.theme === null ? 'Default' : global.stageInfo.word[globalSave.theme];
};

export const switchTheme = () => {
    const upgradeTypes = ['upgrade', 'element', 'inflation'];
    const properties = {
        '--background-color': '#030012',
        '--window-color': '#12121c',
        '--window-border': 'cornflowerblue',
        '--footer-color': 'darkblue',
        '--button-color': 'mediumblue',
        '--button-border': 'darkcyan',
        '--button-hover': '#2626ff',
        '--building-afford': '#a90000',
        '--tab-active': '#8b00c5',
        '--tab-elements': '#9f6700',
        '--tab-strangeness': '#00b100',
        '--tab-inflation': '#6c1ad1',
        '--hollow-hover': '#170089',
        '--footerButton-hover': '#181818',
        '--input-border': '#831aa5',
        '--input-text': '#cf71ff',
        '--button-text': '#e3e3e3',
        '--main-text': 'var(--cyan-text)',
        '--white-text': 'white',
        //'--cyan-text': '#03d3d3',
        '--blue-text': 'dodgerblue',
        '--orange-text': 'darkorange',
        '--gray-text': '#8f8f8f',
        '--orchid-text': '#e14bdb',
        '--darkorchid-text': '#bd24ef',
        '--darkviolet-text': '#8635eb',
        '--red-text': '#eb0000',
        '--green-text': '#00e900',
        '--yellow-text': '#fafa00'
    };

    /* Many of these colors will need to be changed in other places (find them with quick search, there are too many of them) */
    switch (globalSave.theme ?? player.stage.active) {
        case 1:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = '';
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = '';
            }
            properties['--tab-inflation'] = 'var(--tab-active)';
            break;
        case 2:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--white-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            properties['--background-color'] = '#070026';
            properties['--window-color'] = '#000052';
            properties['--window-border'] = 'blue';
            properties['--footer-color'] = '#0000db';
            properties['--button-color'] = '#0000eb';
            properties['--button-border'] = '#386cc7';
            properties['--button-hover'] = '#2929ff';
            properties['--building-afford'] = '#b30000';
            properties['--tab-active'] = '#990000';
            properties['--hollow-hover'] = '#2400d7';
            properties['--input-border'] = '#4747ff';
            properties['--input-text'] = 'dodgerblue';
            properties['--main-text'] = 'var(--blue-text)';
            properties['--gray-text'] = '#9b9b9b';
            properties['--darkorchid-text'] = '#c71bff';
            properties['--darkviolet-text'] = '#8b6bff';
            properties['--green-text'] = '#82cb3b';
            properties['--red-text'] = '#f70000';
            break;
        case 3:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = '';
                getId(`${text}Cost`).style.color = 'var(--green-text)';
            }
            properties['--background-color'] = '#000804';
            properties['--window-color'] = '#2e1200';
            properties['--window-border'] = '#31373e';
            properties['--footer-color'] = '#221a00';
            properties['--button-color'] = '#291344';
            properties['--button-border'] = '#424242';
            properties['--button-hover'] = '#382055';
            properties['--building-afford'] = '#9e0000';
            properties['--tab-active'] = '#8d4c00';
            properties['--tab-elements'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#5a2100';
            properties['--footerButton-hover'] = '#1a1a1a';
            properties['--input-border'] = '#8b4a00';
            properties['--input-text'] = '#e77e00';
            properties['--main-text'] = 'var(--gray-text)';
            properties['--white-text'] = '#dfdfdf';
            properties['--orange-text'] = '#f58600';
            properties['--green-text'] = '#00db00';
            break;
        case 4:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--blue-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--cyan-text)';
            }
            properties['--background-color'] = '#140e04';
            properties['--window-color'] = '#4e0000';
            properties['--window-border'] = '#894800';
            properties['--footer-color'] = '#4e0505';
            properties['--button-color'] = '#6a3700';
            properties['--button-border'] = '#a35700';
            properties['--button-hover'] = '#8a4700';
            properties['--building-afford'] = '#007f95';
            properties['--tab-active'] = '#008297';
            properties['--tab-elements'] = 'var(--tab-active)';
            properties['--tab-strangeness'] = '#00a500';
            properties['--hollow-hover'] = '#605100';
            properties['--footerButton-hover'] = '#212121';
            properties['--input-border'] = '#008399';
            properties['--input-text'] = '#05c3c3';
            properties['--button-text'] = '#d9d900';
            properties['--main-text'] = 'var(--orange-text)';
            properties['--white-text'] = '#e5e500';
            properties['--blue-text'] = '#2e96ff';
            properties['--gray-text'] = '#8b8b8b';
            properties['--darkorchid-text'] = '#c71bff';
            properties['--darkviolet-text'] = '#9457ff';
            properties['--red-text'] = 'red';
            properties['--green-text'] = '#00e600';
            properties['--yellow-text'] = 'var(--green-text)';
            break;
        case 5:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--orange-text)';
                getId(`${text}Effect`).style.color = 'var(--green-text)';
                getId(`${text}Cost`).style.color = 'var(--red-text)';
            }
            properties['--background-color'] = '#060010';
            properties['--window-color'] = '#001d42';
            properties['--window-border'] = '#35466e';
            properties['--footer-color'] = '#2f005c';
            properties['--button-color'] = '#4a008f';
            properties['--button-border'] = '#8f004c';
            properties['--button-hover'] = '#6800d6';
            properties['--building-afford'] = '#8603ff';
            properties['--tab-active'] = '#8500ff';
            properties['--tab-inflation'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#3b0080';
            properties['--footerButton-hover'] = '#1a1a1a';
            properties['--input-border'] = '#3656a1';
            properties['--input-text'] = '#6a88cd';
            properties['--button-text'] = '#fc9cfc';
            properties['--main-text'] = 'var(--darkorchid-text)';
            properties['--white-text'] = '#ff79ff';
            properties['--orchid-text'] = '#ff00f4';
            properties['--darkorchid-text'] = '#c000ff';
            properties['--darkviolet-text'] = '#9f52ff';
            properties['--yellow-text'] = 'var(--darkviolet-text)';
            break;
        case 6:
            for (const text of upgradeTypes) {
                getId(`${text}Text`).style.color = 'var(--orchid-text)';
                getId(`${text}Effect`).style.color = 'var(--orange-text)';
                getId(`${text}Cost`).style.color = 'var(--red-text)';
            }
            properties['--background-color'] = 'black';
            properties['--window-color'] = '#01003c';
            properties['--window-border'] = '#7100ff';
            properties['--footer-color'] = '#00007a';
            properties['--button-color'] = '#2b0095';
            properties['--button-border'] = '#6c1ad1';
            properties['--button-hover'] = '#3d00d6';
            properties['--building-afford'] = '#b30000';
            properties['--tab-active'] = '#8d0000';
            properties['--tab-inflation'] = 'var(--tab-active)';
            properties['--hollow-hover'] = '#490070';
            properties['--input-border'] = '#a50000';
            properties['--input-text'] = 'red';
            properties['--button-text'] = '#efe0ff';
            properties['--main-text'] = 'var(--darkviolet-text)';
            properties['--gray-text'] = '#9b9b9b';
            properties['--darkviolet-text'] = '#8157ff';
            properties['--white-text'] = '#f9f5ff';
            properties['--red-text'] = 'red';
            properties['--yellow-text'] = 'var(--green-text)';
    }

    const body = document.documentElement.style;
    body.setProperty('--transition-all', '800ms');
    body.setProperty('--transition-buttons', '600ms');
    for (const property in properties) { body.setProperty(property, properties[property as '--main-text']); }

    setTimeout(() => {
        body.setProperty('--transition-all', '0ms');
        body.setProperty('--transition-buttons', '100ms');
    }, 800);
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
        body.style.userSelect = '';
        const oldFocus = document.activeElement as HTMLElement | null;
        confirm.focus();

        const key = async(button: KeyboardEvent) => {
            if (button.key === 'Escape' || button.key === 'Enter' || button.key === ' ') {
                button.preventDefault();
                close();
            } else if (button.key === 'Tab') {
                button.preventDefault();
                confirm.focus();
            }
        };
        const close = () => {
            body.style.userSelect = globalSave.toggles[2] ? '' : 'none';
            blocker.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', close);
            specialHTML.alert = [null, null];
            oldFocus?.focus();
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
        body.style.userSelect = '';
        const oldFocus = document.activeElement as HTMLElement | null;
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
            } else if (button.key === 'Tab') {
                button.preventDefault();
                (document.activeElement === cancel ? confirm : cancel).focus();
            }
        };
        const close = (result: boolean) => {
            body.style.userSelect = globalSave.toggles[2] ? '' : 'none';
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            specialHTML.alert = [null, null];
            oldFocus?.focus();
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
        body.style.userSelect = '';
        input.placeholder = placeholder;
        input.value = '';
        const oldFocus = document.activeElement as HTMLElement | null;
        input.focus();

        const yes = () => { close(input.value === '' ? input.placeholder : input.value); };
        const no = () => { close(null); };
        const key = (button: KeyboardEvent) => {
            if (button.key === 'Escape') {
                button.preventDefault();
                no();
            } else if (button.key === 'Enter') {
                if (document.activeElement === cancel) { return; }
                button.preventDefault();
                yes();
            } else if (button.key === ' ') {
                const active = document.activeElement;
                if (active === input || active === cancel) { return; }
                button.preventDefault();
                yes();
            } else if (button.key === 'Tab') {
                if (button.shiftKey && document.activeElement === input) {
                    button.preventDefault();
                    cancel.focus();
                } else if (!button.shiftKey && document.activeElement === cancel) {
                    button.preventDefault();
                    input.focus();
                }
            }
        };
        const close = (result: string | null) => {
            body.style.userSelect = globalSave.toggles[2] ? '' : 'none';
            blocker.style.display = 'none';
            cancel.style.display = 'none';
            input.style.display = 'none';
            body.removeEventListener('keydown', key);
            confirm.removeEventListener('click', yes);
            cancel.removeEventListener('click', no);
            specialHTML.alert = [null, null];
            oldFocus?.focus();
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
        getQuery('#hideToggle > p').textContent = 'Hide';
        getId('stageSelect').classList.add('active');
        setTimeout(animationReset, 800);

        visualUpdate();
        numbersUpdate();
    } else {
        footer.style.animation = 'hideY 800ms backwards';
        arrow.style.animation = 'rotate 800ms backwards';
        getQuery('#hideToggle > p').textContent = 'Show';
        getId('stageSelect').classList.remove('active');
        setTimeout(() => {
            footerArea.style.display = 'none';
            arrow.style.transform = 'rotate(180deg)';
            animationReset();
        }, 800);
    }
};

export const changeFontSize = (initial = false) => {
    const input = getId('customFontSize') as HTMLInputElement;
    const size = Math.min(Math.max(initial ? globalSave.fontSize : (input.value === '' ? 16 : Math.floor(Number(input.value) * 100) / 100), 12), 24);
    if (!initial) {
        globalSave.fontSize = size;
        saveGlobalSettings();

        (getId('milestonesMultiline').parentElement as HTMLElement).style.minHeight = '';
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
    if (htmlInput.value === ' ') { htmlInput.value = ' '; } //No break space
    const allowed = ['.', '·', ',', ' ', '_', "'", '"', '`', '|'].includes(htmlInput.value);
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
            return void Alert("There are no Structures in Intergalactic yet, but they can be created within previous Stages. Any new Stage reset and export from now on will award Strange quarks, also unlock new effect for '[26] Iron' Element\n(Stars in Intergalactic are just Stars from Interstellar)");
        case 6:
            return void Alert('As Galaxies started to Merge, their combined Gravity pushed Vacuum out of its local minimum into more stable global minimum. New forces and Structures are expected within this new and true Vacuum state');
        case 7:
            return void Alert("With Vacuum decaying remaining matter had rearranged itself in such way that lead to the formation of the 'Void'. Check it out in 'Advanced' subtab");
        case 8:
            return void Alert("Soon there will be enough matter to create first 'Universe' within 'Abyss' Stage. Doing it will require to get at least 40 Galaxies before Merge reset. Creating it will do a Vacuum reset, while also resetting Vacuum state back to false");
    }
};
