import Overlimit from './Limit';
import { getId, updateCollapsePointsText } from './Main';
import { calculateMaxLevel, assignMilestoneInformation, toggleConfirm, toggleSwap, calculateEffects, autoUpgradesSet, autoResearchesSet, autoElementsSet, toggleSupervoid, assignBuildingsProduction, assignResetInformation } from './Stage';
import type { globalType, playerType } from './Types';
import { format, switchTab, visualTrueStageUnlocks, visualUpdateResearches, visualUpdateUpgrades } from './Update';
import { prepareVacuum } from './Vacuum';

export const player: playerType = {
    version: 'v0.2.3',
    fileName: 'Fundamental, [dateD.M.Y] [timeH-M-S], [stage]',
    stage: {
        true: 1,
        current: 1,
        active: 1,
        resets: 0,
        time: 0,
        peak: 0,
        input: [0, 0]
    },
    discharge: {
        energy: 0,
        energyMax: 0,
        current: 0
    },
    vaporization: {
        clouds: new Overlimit('0'),
        cloudsMax: new Overlimit('0'),
        input: [3, 0]
    },
    accretion: {
        rank: 0
    },
    collapse: {
        mass: 0.01235,
        massMax: 0.01235,
        stars: [0, 0, 0],
        show: 0,
        maxElement: 0,
        input: [2, 1e6],
        points: []
    },
    merge: {
        reward: [0, 0, 0, 0],
        resets: 0,
        input: 0
    },
    inflation: {
        tree: [],
        spent: 0,
        vacuum: false,
        resets: 0,
        time: 0,
        age: 0
    },
    time: {
        updated: Date.now(),
        started: Date.now(),
        export: [0, 0, 0, 0],
        offline: 0,
        online: 0,
        stage: 0,
        vacuum: 0,
        universe: 0
    },
    buildings: [
        [] as unknown as playerType['buildings'][0], [ //Stage 1
            {
                current: new Overlimit('3'),
                total: new Overlimit('3'),
                trueTotal: new Overlimit('3')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }
        ], [ //Stage 2
            {
                current: new Overlimit('2.7753108348135e-3'),
                total: new Overlimit('2.7753108348135e-3'),
                trueTotal: new Overlimit('2.7753108348135e-3')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }
        ], [ //Stage 3
            {
                current: new Overlimit('1e-19'),
                total: new Overlimit('1e-19'),
                trueTotal: new Overlimit('1e-19')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }
        ], [ //Stage 4
            {
                current: new Overlimit('1'),
                total: new Overlimit('1'),
                trueTotal: new Overlimit('1')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }
        ], [ //Stage 5
            {
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }
        ], [ //Stage 6
            {
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }, {
                true: 0,
                current: new Overlimit('0'),
                total: new Overlimit('0'),
                trueTotal: new Overlimit('0')
            }
        ]
    ],
    strange: [
        {
            current: 0,
            total: 0
        }, {
            current: 0,
            total: 0
        }
    ],
    cosmon: {
        current: 0,
        total: 0
    },
    /* Because I'm lazy to write 50+ 0's, all empty [] auto added */
    upgrades: [],
    researches: [],
    researchesExtra: [],
    researchesAuto: [],
    ASR: [],
    elements: [],
    strangeness: [],
    milestones: [],
    challenges: {
        active: null,
        super: false,
        void: [0, 0, 0, 0, 0, 0],
        supervoid: [0, 0, 0, 0, 0, 0],
        voidCheck: [0, 0, 0, 0, 0, 0]
    },
    toggles: {
        normal: [], //class 'toggleNormal'
        confirm: [], //Class 'toggleConfirm'
        buildings: [], //Class 'toggleBuilding'
        hover: [], //Class 'toggleHover'
        max: [], //Class 'toggleMax'
        auto: [], //Class 'toggleAuto'
        shop: {
            input: 0,
            wait: [2]
        }
    },
    history: {
        stage: {
            best: [3.1556952e16, 0, 0, 0],
            list: [],
            input: [20, 100]
        },
        vacuum: {
            best: [3.1556952e16, false, 0],
            list: [],
            input: [20, 100]
        }
    },
    event: false,
    clone: {}
};

export const global: globalType = {
    tab: 'stage',
    subtab: {
        stageCurrent: 'Structures',
        settingsCurrent: 'Settings',
        upgradeCurrent: 'Upgrades',
        strangenessCurrent: 'Matter',
        inflationCurrent: 'Researches'
    } as globalType['subtab'],
    tabList: { //Order comes from footer
        tabs: ['stage', 'upgrade', 'strangeness', 'inflation', 'settings'],
        stageSubtabs: ['Structures', 'Advanced'],
        settingsSubtabs: ['Settings', 'History', 'Stats'],
        upgradeSubtabs: ['Upgrades', 'Elements'],
        strangenessSubtabs: ['Matter', 'Milestones'],
        inflationSubtabs: ['Researches', 'Milestones']
    } as globalType['tabList'],
    debug: {
        errorID: true,
        errorQuery: true,
        errorGain: true,
        timeLimit: false,
        rankUpdated: null,
        historyStage: null,
        historyVacuum: null
    },
    offline: {
        active: true,
        speed: 0.2,
        stageUpdate: null
    },
    paused: false,
    trueActive: 1,
    lastSave: 0,
    footer: true,
    hotkeys: {
        disabled: true,
        tab: false,
        shift: false,
        ctrl: false
    },
    lastUpgrade: [[null, 'upgrades'], [null, 'upgrades'], [null, 'upgrades'], [null, 'upgrades'], [null, 'upgrades'], [null, 'upgrades'], [null, 'upgrades']],
    lastElement: null,
    lastStrangeness: [null, 0],
    lastInflation: null,
    lastMilestone: [null, 0],
    lastChallenge: [1, 1],
    sessionToggles: [false, false],
    automatization: {
        autoU: [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        autoR: [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        autoE: [
            [],
            [],
            [],
            [],
            [],
            []
        ],
        elements: []
    },
    dischargeInfo: {
        energyType: [[]],
        energyStage: [0],
        energyTrue: 0,
        next: 1,
        total: 0,
        base: 1
    },
    vaporizationInfo: {
        S2Research0: 0,
        S2Research1: 0,
        S2Extra1: 0,
        get: new Overlimit('0')
    },
    accretionInfo: {
        unlockA: [2, 4, 8, 11],
        rankU: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 7],
        rankR: [1, 1, 2, 2, 3, 3, 3, 4, 5],
        rankE: [2, 3, 4, 5, 3, 6],
        rankCost: [5.9722e27, 1e-7, 1e10, 1e24, 5e29, 2.45576045e31, 1.98847e40],
        rankColor: ['blue', 'cyan', 'gray', 'gray', 'gray', 'darkviolet', 'orange', 'gray'],
        rankName: ['Ocean world', 'Cosmic dust', 'Meteoroid', 'Asteroid', 'Planet', 'Jovian planet', 'Protostar', 'Protogalaxy'],
        rankImage: ['Ocean%20world.png', 'Dust.png', 'Meteoroids.png', 'Asteroid.png', 'Planet.png', 'Giant.png', 'Protostar.png', 'Protogalaxy.png'],
        maxRank: 4,
        effective: 1,
        disableAuto: false,
        dustSoft: 1
    },
    collapseInfo: {
        unlockB: [0, 0.01235, 0.23, 10, 40, 1000],
        unlockU: [0.01235, 0.076, 1.3, 10, 40],
        unlockR: [0.18, 0.3, 0.8, 1.3, 40, 1000],
        newMass: 0,
        starCheck: [0, 0, 0],
        trueStars: 0,
        pointsLoop: 0, //Micro optimization
        solarCap: 0.01235,
        timeUntil: Infinity
    },
    mergeInfo: {
        unlockU: [0, 0, 0, 0, 4],
        unlockR: [0, 0, 2, 2],
        unlockE: [0, 2, 3],
        S5Extra2: 0,
        checkReward: [0, 0, 0, 0],
        galaxies: 0
    },
    inflationInfo: {
        globalSpeed: 1,
        totalSuper: 0,
        instability: 1
    },
    intervalsId: {
        main: undefined,
        numbers: undefined,
        visual: undefined,
        autoSave: undefined,
        mouseRepeat: undefined
    },
    stageInfo: {
        word: ['', 'Microworld', 'Submerged', 'Accretion', 'Interstellar', 'Intergalactic', 'Abyss'],
        textColor: ['', 'cyan', 'blue', 'gray', 'orange', 'darkorchid', 'darkviolet'],
        buttonBorder: ['', 'darkcyan', '#386cc7', '#424242', '#a35700', '#8f004c', '#6c1ad1'],
        imageBorderColor: ['', '#008b8b', '#1460a8', '#5b5b75', '#e87400', '#b324e2', '#5300c1'],
        costName: ['', 'Energy', 'Drops', 'Mass', 'Elements', 'Elements', 'Dark matter'],
        activeAll: [1]
    },
    buildingsInfo: {
        maxActive: [0, 4, 6, 5, 5, 4, 2],
        name: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms', 'Molecules'], //[0] Must be 'Mass'
            ['Moles', 'Drops', 'Puddles', 'Ponds', 'Lakes', 'Seas', 'Oceans'],
            ['Mass', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites', 'Subsatellites'],
            ['Elements', 'Brown dwarfs', 'Main sequence', 'Red supergiants', 'Blue hypergiants', 'Quasi-stars'],
            ['Stars', 'Nebulas', 'Star clusters', 'Galaxies'],
            ['Dark matter', 'Universes']
        ],
        hoverText: [
            [],
            ['Mass', 'Preons', 'Quarks', 'Particles', 'Atoms'],
            ['Tritium', 'Drops', 'Puddles', 'Puddles', 'Puddles', 'Puddles'],
            ['Preons hardcap', 'Cosmic dust', 'Planetesimals', 'Protoplanets', 'Satellites'],
            ['Elements', 'Elements', 'Elements', 'Elements', 'Elements'],
            ['Interstellar Stars', 'Interstellar Stars', 'Nebulas and Star clusters'],
            ['Dark matter']
        ],
        type: [
            [],
            ['producing', 'producing', 'producing', 'producing', 'producing'],
            ['producing', 'producing', 'improving', 'improving', 'improving', 'improving'],
            ['producing', 'producing', 'producing', 'improving', 'improving'],
            ['producing', 'producing', 'producing', 'producing', 'producing'],
            ['producing', 'improving', 'improving'],
            ['producing']
        ],
        startCost: [
            [],
            [0, 0.005476, 6, 3, 24, 3],
            [0, 2.7753108348135e-3, 100, 1e7, 1e18, 1e23, 2.676e25],
            [0, 1e-19, 1e-9, 1e21, 1e17, 1e22],
            [0, 1, 1e5, 1e15, 1e27, 1e50],
            [0, 1e50, 1e54, 1e5],
            [0, 1]
        ],
        increase: [
            [],
            [0, 1.4, 1.4, 1.4, 1.4, 1.4],
            [0, 1.15, 1.2, 1.25, 1.35, 1.4, 4],
            [0, 1.15, 1.25, 1.35, 10, 10],
            [0, 1.4, 1.55, 1.70, 1.85, 2],
            [0, 2, 2, 1.11],
            [0, 2]
        ],
        producing: []
    },
    strangeInfo: {
        name: ['Strange quarks', 'Strangelets'],
        stageBoost: [1, 1, 1, 1, 1, 1],
        strangeletsInfo: [0, 1],
        quarksGain: 0
    },
    upgradesInfo: [
        {} as globalType['upgradesInfo'][0], { //Stage 1
            name: [
                'Weak force',
                'Strong force',
                'Electrons',
                'Protons',
                'Neutrons',
                'Superposition',
                'Protium',
                'Deuterium',
                'Tritium',
                'Nuclear fusion',
                'Nuclear fission'
            ],
            effectText: [
                () => 'Particles will produce 8 times more Quarks.',
                () => 'Gluons will be able to bind Quarks into Particles, which will make Particles 16 times cheaper.',
                () => `${player.inflation.vacuum ? 'Atoms' : 'Particles'} will be 8 times cheaper.`,
                () => `Atoms will produce ${player.inflation.vacuum ? 6 : 4} times more Particles.${player.upgrades[1][5] !== 1 && player.buildings[1][player.inflation.vacuum ? 4 : 2].total.lessOrEqual('0') ? '\n(Requires any amount of Atoms to create)' : ''}`,
                () => `Molecules will produce 4 times more Atoms.${player.upgrades[1][5] !== 1 && player.buildings[1][player.inflation.vacuum ? 5 : 3].total.lessOrEqual('0') ? '\n(Requires any amount of Molecules to create)' : ''}`,
                () => `Ability to regain spent Energy and if had enough Energy will also boost production for all ${player.inflation.vacuum ? 'Microworld ' : ''}Structures by ${format(global.dischargeInfo.base, { padding: true })}.${player.inflation.vacuum ? `\n(In true Vacuum it will also reset resources and all non self-made Structures from all Stages${player.stage.true >= 7 ? ' before Abyss' : ''}, and enough self-made Structures to fully regain spent Energy)` : ''}`,
                () => `Decrease Structures cost scaling by -${format(calculateEffects.S1Upgrade6() / 100)}.`,
                () => `Make self-made Structures boost themselves by ${format(calculateEffects.S1Upgrade7())}.${player.inflation.vacuum ? `\n(Self-made Preons boost themselves by ${format(calculateEffects.S1Upgrade7(true), { padding: true })} instead, softcaps instantly and completely disabled after ${format(1001)} Preons)` : ''}`,
                () => `Molecules will produce Molecules. At a reduced rate.\n(${format(new Overlimit(effectsCache.tritium).multiply(global.inflationInfo.globalSpeed), { padding: true })} Molecules per second)`,
                () => `Unspent Energy ${player.upgrades[1][10] === 1 ? '' : `^${format(0.5)}`} will boost 'Tritium' production of Molecules.\n(Boost: ${format(calculateEffects.S1Upgrade9(), { padding: true })})`,
                () => "Unlock full strength of 'Nuclear fusion' and increase effective Energy by 2."
            ],
            startCost: [40, 60, 100, 120, 180, 360, 1200, 3600, 12000, 80000, 2.4e6],
            maxActive: 10
        }, { //Stage 2
            name: [
                'Molecules to Moles',
                'Water spread',
                'Vaporization',
                'Surface tension',
                'Surface stress',
                'Stream',
                'River',
                'Tsunami',
                'Tide'
            ],
            effectText: [
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce Moles'} ${format(player.inflation.vacuum ? 1.02 : 1.04)} times ${player.inflation.vacuum ? 'more' : 'faster'} for every self-made Drop.${player.buildings[2][1].true < 1 && player.buildings[2][2].true < 1 ? '\n(Requires any amount of self-made Drops to create)' : ''}`,
                () => `Spread water faster with every Puddle, current formula is ${format(1.02)} ^ effective Puddles.\nPuddles after 200 and non self-made ones are raised to the power of ${format(0.7)}.\n(Total effect: ${format(calculateEffects.S2Upgrade1(), { padding: true })})`,
                () => { //[2]
                    const softcap = format(calculateEffects.cloudsGain());
                    return `Gain ability to convert Drops into Clouds. Cloud gain formula: (Clouds ^ (1 / ${softcap}) + (Drops / ${format(calculateEffects.S2Upgrade2())})) ^ ${softcap} - Clouds.`;
                },
                () => `Puddles will get a boost based on Moles ^${format(calculateEffects.S2Upgrade3_power())}.\n(Boost: ${format(calculateEffects.S2Upgrade3(), { padding: true })})`,
                () => `Puddles will get a boost based on Drops ^${format(calculateEffects.S2Upgrade4_power())}.\n(Boost: ${format(calculateEffects.S2Upgrade4(), { padding: true })})`,
                () => `Ponds will increase current Puddle amount. (${1 + player.researches[2][4]} extra Puddles per Pond)`,
                () => `Lakes will increase current Pond amount. (${1 + player.researches[2][5]} extra Ponds per Lake)`,
                () => 'Spreads enough water to make Seas increase current Lake amount. (1 extra Lakes per Sea)',
                () => 'Spreads water too fast. 1 extra Seas per Ocean.\nAlso will improve Oceans effect scaling.'
            ],
            startCost: [10, 1e6, 1e10, 1e3, 1e4, 2e9, 5e20, 1e28, 2e48],
            maxActive: 8
        }, { //Stage 3
            name: [
                'Brownian motion',
                'Gas',
                'Micrometeoroid',
                'Streaming instability',
                'Gravitational field',
                'Rubble pile',
                'Magma ocean',
                'Hydrostatic equilibrium',
                'Satellite system',
                'Atmosphere',
                'Pebble accretion',
                'Tidal force',
                'Ring system',
                'Self-gravity'
            ],
            effectText: [
                () => `Through random collisions every self-made Cosmic dust will ${player.inflation.vacuum ? 'delay Preons hardcap even more' : 'produce even more Mass'}.\n(By ${format(calculateEffects.S3Upgrade0())} per self-made Cosmic dust)`,
                () => `New substance for Accretion, will provide boost to Cosmic dust based on its current quantity.\n(Formula: ((self-made + 1) * current) ^${format(calculateEffects.S3Upgrade1_power())} | Boost: ${format(calculateEffects.S3Upgrade1(), { padding: true })})`,
                () => 'Just a small meteoroid, but it will be a good base for what to come.\n(Unlock a new Structure and get 2x boost to Cosmic dust)',
                () => `Small bodies will spontaneously concentrate into clumps.\n(Self-made Planetesimals will boost each other by ${format(calculateEffects.S3Upgrade3())})`,
                () => 'Bodies will become massive enough to affect each other with gravity.\n(Unlock a new Structure and get 3x boost to Planetesimals)',
                () => `Shattered pieces will fall back together. ${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 3.`,
                () => `Melt the core to increase Accretion speed.\n(Cosmic dust strength will be increased by ${format(2 * 1.5 ** player.researches[3][7])})`,
                () => `After reaching equilibrium self-made Protoplanets will boost each other by ${format(1.02)}.`,
                () => 'Unlock yet another Structure.',
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased again (because of drag and escape velocity), by 2.`,
                () => `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be greatly increased by ${8 * 2 ** player.researches[3][8]}.`,
                () => `Satellites cost scaling will be 2 times smaller.${player.inflation.vacuum ? '\nAlso unlock a new Structure.' : ''}`,
                () => 'Satellites effect will scale better.',
                () => `Allow Star clusters to be boosted by ('Gravity' / ${format(2e5)}) ^${format(0.5)} + 1.\n(Boost is equal to ${format((calculateEffects.S3Research6() / 2e5) ** 0.5 + 1, { padding: true })})`
            ],
            startCost: [1e-16, 1e-13, 1e-13, 1, 1e14, 1e17, 1e10, 1e22, 1e22, 1e23, 1e9, 1e26, 1e29, 1e86],
            maxActive: 13
        }, { //Stage 4
            name: [
                'Gravitational Collapse',
                'Proton-proton chain',
                'Carbon-Nitrogen-Oxygen cycle',
                'Helium fusion',
                'Nucleosynthesis'
            ],
            effectText: [
                () => `As fuel runs out, every Star will boost production in its own special way.\nSolar mass ${player.inflation.vacuum ? `on Collapse is Accretion Mass / ${format(1.98847e33)} and ` : ''}will not decrease if to reset below current. (Hover over Remnants effects to see what they boosts)`,
                () => "Fuse with Protium instead of Deuterium. Unlock 5 first Elements. ('Elements' subtab)",
                () => 'Unlock CNO cycle which is a better source of Helium and Energy. Unlock 5 more Elements.',
                () => 'Through Triple-alpha and then Alpha process unlock 2 more Elements.',
                () => `Create new Atomic nuclei with Neutron capture (s-process and p-process).\nUnlock 1 more Element and +1 for every self-made ${player.stage.true >= 7 || player.event ? 'Universe' : '(not unlocked)'}.`
            ],
            startCost: [100, 1000, 1e9, 1e48, 1e128],
            maxActive: 4
        }, { //Stage 5
            name: [
                'Molecular cloud',
                'Super Star cluster',
                'Quasar',
                'Galactic Merger',
                'Placeholder'
            ],
            effectText: [
                () => `Nebula that is dense enough to block the light, it will boost Nebulas by ${format(calculateEffects.S5Upgrade0())}.`,
                () => `A very massive Star cluster that will boost Star clusters by ${format(calculateEffects.S5Upgrade1())}.`,
                () => `Boost per Galaxy will be increased by +${format(calculateEffects.S5Upgrade2(false, 1), { padding: true })}.\n(Effect will be stronger with more Solar mass past ${format(1e5)})`,
                () => `Unlock a new reset type that will bring Galaxies closer for potential Merging.${player.inflation.vacuum ? ' That reset behaves like a Galaxy reset, while also converting self-made Galaxies into non self-made through new and even bigger Structures. Can only be done once per Stage reset.' : ''}`,
                () => 'Will added later.'
            ],
            startCost: [1e56, 1e60, 1e120, 1e160, Infinity],
            maxActive: 4
        }, { //Stage 6
            name: [],
            effectText: [],
            startCost: [],
            maxActive: 0
        }
    ],
    researchesInfo: [
        {} as globalType['researchesInfo'][0], { //Stage 1
            name: [
                'Stronger Protium',
                'Better Deuterium',
                'Improved Tritium',
                'Requirement decrease',
                'Discharge improvement',
                'Radioactive Discharge'
            ],
            effectText: [
                () => `Cost scaling will be -${format(0.03)} smaller with each level.`,
                () => `Self-made Structures will boost each other by additional +${format(0.01)}.`,
                () => `Molecules will produce themselves ${format(calculateEffects.S1Research2())} times quicker.`,
                () => `Discharge goals requirement will scale slower. (-2)\n(Creating this Research will make next Discharge goal to be ${format(calculateEffects.dischargeCost(calculateEffects.dischargeScaling(player.researches[1][3] + 1)))} Energy)`,
                () => { //[4]
                    const newBase = calculateEffects.dischargeBase(player.researches[1][4] + 1);
                    return `Discharge production boost from reached goals will be increased by +${format(newBase - global.dischargeInfo.base)}.\n(This is equal to ${format((newBase / global.dischargeInfo.base) ** global.dischargeInfo.total, { padding: true })}x boost improvement)`;
                },
                () => `Discharge goals will be able to boost 'Tritium'.\n(Current effect: ${format(calculateEffects.S1Research5())} ^ level)`
            ],
            cost: [],
            startCost: [1600, 4800, 16000, 32000, 16000, 24000],
            scaling: [400, 1200, 8000, 40000, 16000, 16000],
            max: [5, 4, 8, 2, 4, 3],
            maxActive: 6
        }, { //Stage 2
            name: [
                'Better Mole production',
                'Better Drop production',
                'Stronger surface tension',
                'Stronger surface stress',
                'More streams',
                'Distributary channel'
            ],
            effectText: [
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce Moles'} 3 times more.${player.upgrades[2][2] === 1 || player.inflation.vacuum ? `\nEffective level ${global.vaporizationInfo.S2Research0 !== player.researches[2][0] ? `is ${format(global.vaporizationInfo.S2Research0, { padding: true })}, will be restored with more Drops` : 'will be set to 0 after any reset'}.` : ''}${player.buildings[2][1].true < 1 && player.buildings[2][2].true < 1 && player.researches[2][0] < 1 ? '\n(Requires any amount of self-made Drops to create)' : ''}`,
                () => `Puddles will produce 2 times more Drops.${player.upgrades[2][2] === 1 || player.inflation.vacuum ? `\nEffective level ${global.vaporizationInfo.S2Research1 !== player.researches[2][1] ? `is ${format(global.vaporizationInfo.S2Research1, { padding: true })}, will be restored with more Drops` : 'will be set to 0 after any reset'}.` : ''}`,
                () => { //[2]
                    const power = calculateEffects.S2Upgrade3_power(player.researches[2][2] + 1) - calculateEffects.S2Upgrade3_power();
                    return `'Surface tension' base will be +${format(power)} stronger.\n(This is equal to ${format(calculateEffects.S2Upgrade3(power), { padding: true })}x boost improvement)`;
                },
                () => { //[3]
                    const power = calculateEffects.S2Upgrade4_power(player.researches[2][3] + 1) - calculateEffects.S2Upgrade4_power();
                    return `'Surface stress' base will be +${format(power)} stronger.\n(This is equal to ${format(calculateEffects.S2Upgrade4(power), { padding: true })}x boost improvement)`;
                },
                () => 'With more streams, will be able to have even more extra Puddles. (+1 extra Puddles per Pond)',
                () => 'Rivers will be able to split, which will allow even more Ponds per Lake. (+1 per)'
            ],
            cost: [],
            startCost: [10, 400, 1e4, 1e5, 1e14, 1e22],
            scaling: [1.366, 5, 1e3, 1e2, 1e3, 1e4],
            max: [8, 8, 4, 4, 2, 1],
            maxActive: 6
        }, { //Stage 3
            name: [
                'More massive bodies',
                'Adhesion',
                'Space weathering',
                'Inelastic collisions',
                'Destructive collisions',
                'Contact binary',
                'Gravity',
                'Planetary differentiation',
                'Aerodynamic drag'
            ],
            effectText: [
                () => 'Increase strength of Cosmic dust by 3.',
                () => `Cosmic dust particles will cling to each other. (+${format(0.01)} to 'Brownian motion')`,
                () => 'Planetesimals will produce more Cosmic dust. (3 times more)',
                () => `Slow encounter velocities will result in a more efficient growth.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 2.`,
                () => `Planetesimals when shatter will replenish small grains quantity.\n'Streaming instability' effect will be increased by +${format(0.005)}.`,
                () => `Some Planetesimals instead of shattering will form a contact binary or even trinary.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be increased by 3.`,
                () => { //[6]
                    const effect = calculateEffects.S3Research6();
                    return `Planetesimals will attract other bodies and get a boost to own production based on unspent Mass ^${format(effect > 1 ? logAny(effect, player.buildings[3][0].current.toNumber()) : 0, { padding: true })}.\n(Boost: ${format(effect, { padding: true })} ⟶ ${format(calculateEffects.S3Research6(player.researches[3][6] + 1), { padding: true })}, weaker after ${format(1e21)} Mass)`;
                },
                () => `'Magma Ocean' will become stronger, by ${format(1.5)}.`,
                () => `Improve 'Pebble accretion' Accretion speed even more.\n${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will increased by 2.`
            ],
            cost: [],
            startCost: [1e-16, 1e-15, 1e-5, 1e2, 1e10, 1e11, 1e15, 1e14, 1e12],
            scaling: [11, 111, 22, 10, 100, 100, 10, 1e4, 1e3],
            max: [9, 3, 8, 8, 2, 2, 6, 4, 4],
            maxActive: 9
        }, { //Stage 4
            name: [
                'Planetary system',
                'Star system',
                'Protoplanetary disk',
                'Planetary nebula',
                'Gamma-ray burst',
                'Inner Black hole'
            ],
            effectText: [
                () => `From Planetesimals to Planets, will get ${format(calculateEffects.S4Research0_base())}x boost to all Stars per level.\n(Total boost: ${format(calculateEffects.S4Research0(), { padding: true })})`,
                () => { //[1]
                    const base = calculateEffects.S4Research1();
                    return `All self-made Stars will boost each other by ${format(base)}.\n(Total boost: ${format(new Overlimit(base).power(global.collapseInfo.trueStars), { padding: true })} ⟶ ${format(new Overlimit(calculateEffects.S4Research1(player.researches[4][1] + 1)).power(global.collapseInfo.trueStars), { padding: true })})`;
                },
                () => `Improve effect scaling of 'Planetary system', as well increase its max level by +3.\n(Total boost from 'Planetary system' will be increased by ${format(calculateEffects.S4Research0(calculateEffects.S4Research0_base(player.researches[4][2] + 1) / calculateEffects.S4Research0_base()), { padding: true })})`,
                () => "Matter will be expelled from Red giants, this will boost Main-sequence Stars by 2, as well increase 'Planetary system' max level by +3.",
                () => `An immensely energetic explosion that will boost all Stars by ${format(calculateEffects.S4Research4(), { padding: true })}${player.researches[4][4] < 2 ? ` ⟶ ${format(calculateEffects.S4Research4(false, player.researches[4][4] + 1), { padding: true })}` : ''}.\n(Effect will be stronger with more Black holes${player.elements[23] >= 1 ? ' and Solar mass' : ''})`,
                () => 'Quasi-stars will Collapse into Intermediate-mass Black holes that are equivalent to +1 (Stellar) Black holes per level.'
            ],
            cost: [],
            startCost: [1e3, 5e4, 1e8, 1e11, 1e28, 1e154],
            scaling: [10, 200, 1e12, 1, 2e8, 1e216],
            max: [3, 2, 1, 1, 2, 1],
            maxActive: 5
        }, { //Stage 5
            name: [
                'Higher density',
                'Type frequency',
                'Jeans instability',
                'Gravitational binding Energy'
            ],
            effectText: [
                () => `Higher density of Nebulas, will allow them to produce higher tier of Stars, but each tier is 4 times slower than previous one. Also will boost Nebulas by 2.\nNext tier will be ${global.buildingsInfo.name[4][Math.min(player.researches[5][0] + 2, player.inflation.vacuum ? 5 : 4)]}.`,
                () => `More of same Star type will be found within Star cluster. Star clusters and their minimum strength will be improved by 2 and will also boost lower tier of Stars, but 2 times less than previous one.\nNext tier will be ${global.buildingsInfo.name[4][Math.max((player.inflation.vacuum ? 4 : 3) - player.researches[5][1], 1)]}.`,
                () => `Weaken internal gas pressure within Nebulas to cause even more gravitational Collapses.\nWhich will make every self-made Nebula will boost each other by ${format(calculateEffects.S5Research2())}. (+${format(0.0075)} per level)`,
                () => `Increase required Energy for Star clusters to cease being in a gravitationally bound state.\nWhich will make every self-made Star cluster boost each other by ${format(calculateEffects.S5Research3())}. (+${format(0.0075)} per level)`
            ],
            cost: [],
            startCost: [1e54, 1e58, 1e200, 1e210],
            scaling: [1e8, 1e8, 1e30, 1e30],
            max: [4, 4, 2, 2],
            maxActive: 2
        }, { //Stage 6
            name: [],
            effectText: [],
            cost: [],
            startCost: [],
            scaling: [],
            max: [],
            maxActive: 0
        }
    ],
    researchesExtraInfo: [
        {} as globalType['researchesExtraInfo'][0], { //Stage 1
            name: [
                'Extra strong force',
                'Improved formula',
                'Accretion',
                'Later Preons',
                'Impulse',
                'Radioactive decay'
            ],
            effectText: [
                () => "Mesons will be able to bind Particles to form Atoms, which will make Atoms to be affected by 'Strong force'.\n(Atoms will be 16 times cheaper)",
                () => { //[1]
                    const now = calculateEffects.S1Extra1();
                    const after = calculateEffects.S1Extra1(player.researchesExtra[1][1] + 1);
                    return `Improve 'Tritium' formula, current formula is log${format(now)}${player.researchesExtra[1][1] < 4 ? ` ⟶ log${format(after)}.\n(Which is equal to ${format(logAny(now, after), { padding: true })}x improvement)` : '.'}`;
                },
                () => `First level is to begin the Accretion, second level is to Submerge it.\nAll Structures produce Energy on creation and all resets affect all lower Stages, while also doing Discharge reset.\nAccretion Mass is Microworld Mass * ${format(1.78266192e-33)} and Moles are Molecules / ${format(6.02214076e23)}.`,
                () => { //[3]
                    const power = calculateEffects.S1Extra3();
                    const energy = calculateEffects.effectiveEnergy();
                    return `Boost Preons and delay hardcap by current Energy ^${format(power)}.\n(Effect: ${format(energy ** power, { padding: true })} ⟶ ${format(energy ** calculateEffects.S1Extra3(player.researchesExtra[1][3] + 1), { padding: true })})`;
                },
                () => { //[4]
                    const base = calculateEffects.S1Extra4();
                    return `Discharge goals will be able to boost all Interstellar Stars, strength is based on Energy and Discharge base.\nCurrent base is ${format(base, { padding: true })}, total boost is ${format(base ** global.dischargeInfo.total, { padding: true })}.`;
                },
                () => `Improve 'Impulse' base strength even more.\n(This will increase total boost by ${format((calculateEffects.S1Extra4(player.researchesExtra[1][5] + 1) / calculateEffects.S1Extra4()) ** global.dischargeInfo.total, { padding: true })})`
            ],
            cost: [],
            startCost: [2000, 40000, 12000, 16000, 160000, 1.6e6],
            scaling: [0, 16000, 68000, 16000, 0, 1.6e6],
            max: [1, 4, 2, 4, 1, 2],
            maxActive: 0
        }, { //Stage 2
            name: [
                'Natural Vaporization',
                'Rain Clouds',
                'Storm Clouds',
                'Water Accretion',
                'Jeans Mass'
            ],
            effectText: [
                () => 'When formed Clouds will use Drops produced this reset instead of current ones.',
                () => { //[1]
                    const maxLevel = player.researchesExtra[2][1];
                    const trueLevel = global.vaporizationInfo.S2Extra1;
                    const penalty = player.buildings[2][2].true < 1;
                    const effect = calculateEffects.S2Extra1;
                    return `Some Clouds will start pouring Drops themselves. This will boost Puddles, even if there are none, based on current Clouds.${player.researchesExtra[2][2] < 1 ? `\nEffective level ${trueLevel !== maxLevel ? `is ${format(trueLevel, { padding: true })}, will be restored with more Drops, this doesn't` : "will be set to 0 after any reset, this won't"} affect pre Puddles boost.` : ''}\n(Effect: ${format(penalty ? (effect(maxLevel) - 1) * global.inflationInfo.globalSpeed : effect(trueLevel), { padding: true })} ⟶ ${format(penalty ? (effect(maxLevel + 1) - 1) * global.inflationInfo.globalSpeed : effect(maxLevel + (trueLevel === maxLevel ? 1 : 0)), { padding: true })}, weaker after ${format(1e6)} Clouds)`;
                },
                () => `Make 'Rain Clouds' boost Seas at a reduced rate and also prevent its effective level from resetting.\n(Effect: ${format(calculateEffects.S2Extra2(calculateEffects.S2Extra1(global.vaporizationInfo.S2Extra1), 1), { padding: true })})`,
                () => { //[3]
                    const level = player.researchesExtra[2][3];
                    return `Submerge and boost Stars with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Stars: ${level < 3 ? `${format(level < 1 ? 1 : effectsCache.S2Upgrade3 * (level > 1 ? effectsCache.S2Upgrade4 ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(effectsCache.S2Upgrade3 * (level < 1 ? 1 : effectsCache.S2Upgrade4 ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                },
                () => { //[4]
                    const level = player.researchesExtra[2][4];
                    return `High density of Drops will end up boosting Nebulas with 'Surface tension'. Also with 'Surface stress' ^${format(0.5)} at level 2, full power at level 3.\n(Boost to Nebulas: ${level < 3 ? `${format(level < 1 ? 1 : effectsCache.S2Upgrade3 * (level > 1 ? effectsCache.S2Upgrade4 ** 0.5 : 1), { padding: true })} ⟶ ` : ''}${format(effectsCache.S2Upgrade3 * (level < 1 ? 1 : effectsCache.S2Upgrade4 ** (level > 1 ? 1 : 0.5)), { padding: true })})`;
                }
            ],
            cost: [],
            startCost: [1e18, 1e12, 1e26, 1e14, 1e60],
            scaling: [1, 1e3, 1, 1e8, 1e8],
            max: [1, 3, 1, 3, 3],
            maxActive: 3
        }, { //Stage 3
            name: [
                'Rank boost',
                'Efficient growth',
                'Weight',
                'Viscosity',
                'Efficient submersion',
                'Ablative armor'
            ],
            effectText: [
                () => `Increase strength of Cosmic dust by another ${format(1.11)} per level. Max level is based on current Rank.\n(Total increase: ${format(1.11 ** player.researchesExtra[3][0], { padding: true })})`,
                () => { //[1]
                    const base = calculateEffects.S3Extra1();
                    return `${player.inflation.vacuum ? 'Preons hardcap delay' : 'Mass production'} from Cosmic dust will be even bigger, current formula is ${format(base)} ^ current Rank.\n(Total boost: ${format(base ** global.accretionInfo.effective, { padding: true })} ⟶ ${format(calculateEffects.S3Extra1(player.researchesExtra[3][1] + 1) ** global.accretionInfo.effective, { padding: true })})`;
                },
                () => "'Gravitational field' will be able to boost Protoplanets, but at reduced strength. (2x boost)",
                () => `'Gas' will be ${format(calculateEffects.S3Upgrade1(calculateEffects.S3Upgrade1_power(player.researchesExtra[3][3] + 1)) / calculateEffects.S3Upgrade1(), { padding: true })} times stronger per level.`,
                () => `Submerge quicker by boosting Puddles, improved by current Rank.\n(Current boost: ${format(calculateEffects.S3Extra4())} ⟶ ${format(calculateEffects.S3Extra4(player.researchesExtra[3][4] + 1))})`,
                () => `Protect your Mass from being removed by removing Cosmic dust hardcap instead.\nSecond level will redirect delay to hardcap as a boost to Cosmic dust that ignores softcap.\n(Current hardcap delay is ${format(calculateEffects.dustDelay(), { padding: true })})`
            ],
            cost: [],
            startCost: [1e-18, 1e-7, 1e26, 1e9, 1e-10, 1.98847e40],
            scaling: [10, 100, 1, 1e5, 1e12, 5.024e59],
            max: [14, 6, 1, 5, 1, 2],
            maxActive: 4
        }, { //Stage 4
            name: [
                'Nova',
                'Mass transfer',
                'White dwarfs',
                'Quark-nova'
            ],
            effectText: [
                () => `This violent stellar explosion is main source of Elements, but also starts new Star formation.\nUnlock a new Star and even more, after Collapse of that Star.\n(Will require at least ${format(global.collapseInfo.unlockB[Math.min(player.researchesExtra[4][0] + 2, 4)])} Solar mass to create that new Star)`,
                () => `Star material will transfer from one Star to another, improving Solar mass gain${player.inflation.vacuum ? ' (also delaying Preons hardcap)' : ''} by ${format(calculateEffects.S4Extra1())}.\nImproved by 'Star system' levels and also improves its scaling (effect increase for 'Star system' is ${format(new Overlimit(calculateEffects.S4Research1(undefined, 1) / calculateEffects.S4Research1(undefined, 0)).power(global.collapseInfo.trueStars), { padding: true })}).`,
                () => `After matter were dispeled from Red giant, White dwarf was all that remained.\nImproves effect of '[6] Carbon' by +${format(0.5)} and increases max level of 'Star system' by +1.`,
                () => "As Neutron stars spins down, some of them may be converted into Quark stars.\nThis will add new effect to Neutron stars ‒ all Stars are cheaper, also will increase max level of 'Star system' by +1."
            ],
            cost: [],
            startCost: [4e4, 2e9, 1e50, 1e136],
            scaling: [1e10, 1, 1, 1],
            max: [3, 1, 1, 1],
            maxActive: 3
        }, { //Stage 5
            name: [
                'Hypercompact stellar system',
                'Interacting Galaxies',
                'Central dominant Galaxy'
            ],
            effectText: [
                () => `Super dense core which will allow creation of a new Structure. That Structure will increase Stage reset reward${player.inflation.vacuum ? ', starting Energy after any Reset' : ''}, boost Nebulas and Star clusters, but creating it fully resets ${player.inflation.vacuum ? 'all' : 'Interstellar and Intergalactic'} Stages.\nThis Research ${player.strangeness[5][3] < 1 ? "can't be created because 'Gravitational bound' is missing" : 'also removes Solar mass and other Remnants requirement from everything in Interstellar'}.`,
                () => `Allow use of excess Galaxies from previous Merge resets when forming new Galaxy groups.${global.researchesExtraInfo[5].max[1] > 1 ? '\nAdditional levels will instead reduce amount of Galaxies required by -4 per level.' : ''}`,
                () => { //[2]
                    const maxLevel = player.researchesExtra[5][2];
                    const trueLevel = global.mergeInfo.S5Extra2;
                    return `An even bigger Galaxy to improve Stage reset reward and Galaxy Groups effect with every Galaxy Group.\nEffective level ${trueLevel !== maxLevel ? `is ${format(trueLevel, { padding: true })}, will be restored with more Elements, this doesn't` : "will be set to 0 after any reset, this won't"} affect Stage reset reward.\n(Total boost: ${format(calculateEffects.S5Extra2(trueLevel), { padding: true })} ⟶ ${format(calculateEffects.S5Extra2(maxLevel + (maxLevel === trueLevel ? 1 : 0)), { padding: true })})`;
                }
            ],
            cost: [],
            startCost: [1e80, 1e250, '1e310'] as unknown as Overlimit,
            scaling: [1, 1e150, 1e30],
            max: [1, 1, 4],
            maxActive: 1
        }, { //Stage 6
            name: [],
            effectText: [],
            cost: [],
            startCost: [],
            scaling: [],
            max: [],
            maxActive: 0
        }
    ],
    researchesAutoInfo: {
        name: [
            'Upgrade automatization',
            'Element automatization',
            'Reset automatization'
        ],
        effectText: [
            () => `Automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.researchesAuto[0], 2)]} from any Stage.`,
            () => 'Elements will no longer require Collapse for activation.\nSecond level will unlock auto creation of Elements.',
            () => { //[2]
                const index = player.researchesAuto[2] >= 4 ? 4 : Math.min(player.inflation.vacuum ? player.researchesAuto[2] : player.stage.current - 1, 3);
                return `Unlock auto ${['Discharge', 'Vaporization', 'Rank', 'Collapse', 'Merge'][player.inflation.vacuum ? (index === 1 ? 2 : index === 2 ? 1 : index) : index]} level 1.${player.inflation.vacuum ? '\nCost will decrease by -1 level per related level 1 Strangeness.' : ''}`;
            }
        ],
        costRange: [
            [1e13, 2e34, 1e30],
            [136000, 272000],
            [1200, 2400, 7200, 28800, 144000]
        ],
        autoStage: [
            [2, 3, 4],
            [1, 1],
            [6, 6, 6, 6, 6]
        ],
        max: [3, 2, 1]
    },
    ASRInfo: {
        name: 'Auto Structures',
        effectText: () => {
            const stageIndex = player.stage.active;
            const index = Math.min(player.ASR[stageIndex] + 1, Math.max(global.ASRInfo.max[stageIndex], 1));
            let unlocked = true;
            if (player.stage.true < 6) {
                if (stageIndex === 3 && player.stage.resets < 5) {
                    if (index === 2) {
                        unlocked = player.upgrades[3][2] === 1 || player.buildings[3][2].trueTotal.moreThan('0');
                    } else if (index === 3) {
                        unlocked = player.upgrades[3][4] === 1 || player.buildings[3][3].trueTotal.moreThan('0');
                    }
                } else if (stageIndex === 5) {
                    if (index === 1) {
                        unlocked = player.milestones[2][0] >= 7;
                    } else if (index === 2) {
                        unlocked = player.milestones[3][0] >= 7;
                    } else if (index === 3) {
                        unlocked = player.milestones[4][1] >= 8;
                    }
                }
            } else if (player.stage.true < 7) {
                if (player.stage.resets < 2 && index === 5) {
                    if (stageIndex === 3) {
                        unlocked = player.upgrades[3][11] === 1 || player.buildings[3][5].trueTotal.moreThan('0');
                    } else if (stageIndex === 4) {
                        unlocked = player.elements[26] >= 1;
                    }
                }
            }
            return `Automatically make ${unlocked ? global.buildingsInfo.name[stageIndex][index] : '(not unlocked)'} (counts as self-made).\n(Auto ${(stageIndex === 5 && index === 3) || stageIndex >= 6 ? "for this Structure doesn't wait and ignores related settings" : `will wait until ${format(player.toggles.shop.wait[stageIndex])} times of the Structure cost`})`;
        },
        costRange: [
            [],
            [2000, 8000, 16000, 32000, 56000],
            [1e10, 1e14, 1e18, 1e23, 1e28, 1e30],
            [1e-7, 1e10, 5e29, 2e30, 2e36],
            [1e6, 1e17, 1e28, 1e39, 1e52],
            [1e56, 1e60, 1e100],
            [Infinity]
        ],
        max: [0, 3, 5, 4, 4, 3, 0]
    },
    elementsInfo: {
        name: [
            '[0] Neutronium',
            '[1] Hydrogen',
            '[2] Helium',
            '[3] Lithium',
            '[4] Beryllium',
            '[5] Boron',
            '[6] Carbon',
            '[7] Nitrogen',
            '[8] Oxygen',
            '[9] Fluorine',
            '[10] Neon',
            '[11] Sodium',
            '[12] Magnesium',
            '[13] Aluminium',
            '[14] Silicon',
            '[15] Phosphorus',
            '[16] Sulfur',
            '[17] Chlorine',
            '[18] Argon',
            '[19] Potassium',
            '[20] Calcium',
            '[21] Scandium',
            '[22] Titanium',
            '[23] Vanadium',
            '[24] Chromium',
            '[25] Manganese',
            '[26] Iron',
            '[27] Cobalt',
            '[28] Nickel',
            '[29] Copper',
            '[30] Zinc',
            '[31] Gallium',
            '[32] Germanium'
        ],
        effectText: [
            () => `Element with no protons, true head of this table.\nThis one is ${Math.random() < 0.1 ? (Math.random() < 0.1 ? 'an illusive Tetraneutron, or maybe even Pentaneutron, wait where did it go? Was it even there?' : 'a rare Dineutron, but it is already gone...') : 'a simple Mononeutron, it will stay with you for as long as it can.'}`,
            () => `Most basic Element, increases Brown dwarf${player.inflation.vacuum ? ' and Puddles' : ''} production by 2.`,
            () => `Fusion reaction byproduct, makes Interstellar Stars cost scale -${format(0.1)} less.`,
            () => `First metal, Solar mass gain${player.inflation.vacuum ? ' and hardcap delay for Cosmic dust' : ''} per Brown dwarf will be lightly increased.`,
            () => `Brittle earth metal and so is brittle increase to production.\n(${format(1.4)}x boost to all Stars${player.inflation.vacuum ? ' and Cosmic dust' : ''})`,
            () => `A new color, and a new boost to Solar mass gain${player.inflation.vacuum ? ' and delay to Cosmic dust hardcap' : ''} that is based on current Dwarf Stars.`,
            () => `Base for organics, boost from Red giants will be increased by ^${format(calculateEffects.element6())}.`,
            () => "Most abundant Element in atmosphere of some Planets that will allow to have 2 extra levels of 'Star system'.",
            () => `An oxidizing agent that will make Interstellar Stars cost scale even slower. (-${format(0.05)} less)`,
            () => "Highly toxic and reactive, +12 to max level of 'Planetary system'.",
            () => `A noble 2x boost to Solar mass gain${player.inflation.vacuum ? ' and delay to Preons hardcap' : ''}.`,
            () => "Through leaching will get 1 extra level of 'Protoplanetary disk'.",
            () => 'Stars are inside you, as well Neutron stars strength will be increased by log4.',
            () => 'Has a great affinity towards Oxygen and to decrease cost for all Stars by 100.',
            () => `Just another tetravalent metalloid, and so is another ${format(1.4)}x boost to all Stars${player.inflation.vacuum ? ' and Cosmic dust' : ''}.`,
            () => `One of the Fundamentals for Life and to make all Stars boost Solar mass gain${player.inflation.vacuum ? ' and also delay Cosmic dust hardcap' : ''}.`,
            () => "A burning rock that will increase max level of 'Star system' by 1.",
            () => "Extremely reactive to extend max level of 'Planetary system' by another 24 levels.",
            () => 'Less noble, but Black holes effect will be a little stronger.',
            () => "Don't forget about it and will get 1 free level of 'Planetary system'.\n(Also will make Solar mass effect apply twice to Brown dwarfs)",
            () => "Get stronger with 1 extra level of 'Star system'.",
            () => `A new color and a rare bonus of ^${format(1.1)} to Solar mass effect.`,
            () => 'Part of a new alloy that will allow for Red giants to be added into effective amount of Neutron stars.',
            () => `Catalyst for production of Elements. 'Gamma-ray burst' effect will be increased by Solar mass ^${format(0.1)}.\n(Effect increase: ${format(player.collapse.mass ** 0.1, { padding: true })})`,
            () => `No corrosion, only boost to all Stars that is based on unspent Elements ^${format(calculateEffects.element24_power())}.\n(Boost to Stars: ${format(calculateEffects.element24(), { padding: true })})`,
            () => "Brittle Element, but not the bonus ‒ 1 more level in 'Star system'.",
            () => `Any further fusion will be an endothermic process. ${player.inflation.vacuum ? `Unlock a new Star type${player.strangeness[5][3] >= 1 ? ' and Intergalactic Stage' : ''}` : 'Enter Intergalactic space'}.\n(${player.stage.true >= 6 || player.strange[0].total >= 1 ? `Current base for Stage reset reward is ${format(effectsCache.element26, { padding: true })}, improve it further by producing more Elements this Stage` : 'Can change active Stage from footer, new effect will be added after another Stage reset'})`,
            () => `Combined and ready to make all self-made Red supergiants count as Red giants and improve '[24] Chromium' Element by +^${format(0.01)}.`,
            () => "Slow to react, but will increase max level of 'Star system' by +1.",
            () => `Does not need to be prepared to increase Stage reset reward base by Arithmetic progression with step of ${format(0.01)}.`,
            () => `First of new Elements to come, increases max allowed Merge resets by +1 for every new Element past '[29] Copper'.\n(Currently highest created Element in current Stage reset is '${global.elementsInfo.name[player.collapse.maxElement]}', equals to +${Math.max(player.collapse.maxElement - 29, 0)} allowed Merges)`,
            () => `Will melt in palm of your hand to make all Galaxies scale slower. (${format(-0.01)})`,
            () => "Too late to appear, but will increase max level of 'Inner Black hole' by +1 anyway."
        ],
        startCost: [ //New Element cost must be higher than previous one
            0, 1000, 4000, 2e4, 1e5, 1e8, 1e10, 4e11, 8e12, 6e13,
            1e15, 1e20, 1e22, 1e24, 1.4e26, 1e28, 1e30, 1e32, 2e36, 1e38,
            1e39, 1e41, 2e42, 3e43, 4e44, 5e45, 1e48, 1e54, 1e58, 1e140,
            1e200, 1e220, '1e340'
        ] as unknown as Overlimit[]
    },
    strangenessInfo: [
        {} as globalType['strangenessInfo'][0], { //Stage 1
            name: [
                'Fundamental boost',
                'Better improvement',
                'Cheaper Discharge',
                'Free Discharge',
                'Automatic Discharge',
                'Auto Structures',
                'Strange boost',
                'Energy increase',
                'Conservation of Mass',
                'Conservation of Energy'
            ],
            effectText: [
                () => `Boost all Microworld Structures by ${format(player.inflation.vacuum ? 2 : 1.8)}.`,
                () => `Base for 'Improved Tritium' Research will be bigger by +${format(player.inflation.vacuum ? 1.5 : 1)}.\n(Boost from it at current Research level is ${format((calculateEffects.S1Research2(player.strangeness[1][1] + 1) / calculateEffects.S1Research2()) ** player.researches[1][2], { padding: true })})`,
                () => `Discharge goals requirement will scale slower. (-${format(0.5)})\n(Creating this Strangeness will make next Discharge goal to be ${format(calculateEffects.dischargeCost(calculateEffects.dischargeScaling(undefined, player.strangeness[1][2] + 1)))} Energy)`,
                () => `Obtain +${format(0.5)} bonus Discharge goals.`,
                () => `Automatically Discharge upon reaching next goal or spending Energy. (Need to be enabled in Settings)${global.strangenessInfo[1].max[4] > 1 ? '\nSecond level will allow to gain Discharge goals based on current Energy instead of needing to reset.' : ''}`,
                () => 'Make auto for all Microworld Structures permanent.',
                () => `Unspent Strange quarks will boost Microworld by improving its Structures.\n(Formula: (x + 1) ^${format(player.inflation.vacuum ? 0.26 : 0.22)} | Effect: ${format(global.strangeInfo.stageBoost[1], { padding: true })})`,
                () => 'Increase Energy gain from creating Preons by +2.',
                () => { //[8]
                    const improved = player.challenges.supervoid[1] >= 2;
                    return `No Mass will be lost when creating Preons${improved ? '' : ', only works when Accretion Stage is unlocked'}.\nSecond level will disable auto Accretion Structures if Cosmic dust is hardcapped until will have enough Mass for the highest Solar mass conversion${improved ? " or to increase current Rank, if its below 'Protostar' and 'Automatic Rank' level is below 2" : ', only works if Interstellar Stage is unlocked'}.`;
                },
                () => 'No Energy will be lost when creating Upgrades or Researches, only works when Interstellar Stage is unlocked.'
            ],
            cost: [],
            startCost: [1, 1, 1, 2, 12, 2, 24, 2, 12, 15600],
            scaling: [2.46, 2, 6, 6, 400, 1, 1, 6, 10, 1],
            max: [6, 4, 4, 2, 1, 1, 1, 2, 2, 1],
            maxActive: 7
        }, { //Stage 2
            name: [
                'More Moles',
                'Bigger Puddles',
                'More spread',
                'Cloud density',
                'Automatic Vaporization',
                'Auto Structures',
                'Strange boost',
                'Improved flow',
                'Mechanical spread',
                'Ocean world'
            ],
            effectText: [
                () => `Drops will ${player.inflation.vacuum ? 'improve Tritium' : 'produce'} 2 times more${player.inflation.vacuum ? '' : ' Moles'}.`,
                () => `Puddles will produce ${format(player.inflation.vacuum ? 1.8 : 1.6)} times more Drops.`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[2][2] >= 1) { extraText = "max level increased for 'More streams' (+1)"; }
                    if (player.strangeness[2][2] >= 2) { extraText += " and 'Distributary channel' (+1)"; }
                    if (player.strangeness[2][2] >= 3) { extraText += ", a new Upgrade ‒ 'Tsunami'"; }
                    return `Increase max level for one of Researches. Final level will instead unlock a new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => `Decrease amount of Drops required to get a Cloud by ${format(player.inflation.vacuum ? 2.5 : 2)}.`,
                () => `Automatically Vaporize when reached enough boost from new Clouds. (Need to be enabled in Settings)${global.strangenessInfo[2].max[4] > 1 ? `\nSecond level will allow to automatically gain ${format(2.5)}% of Clouds per second.${player.stage.true >= 7 ? ' (Not affected by global speed)' : ''}` : ''}`,
                () => 'Make auto for all Submerged Structures permanent.',
                () => `Unspent Strange quarks will boost Submerged by improving Puddles.\n(Formula: (x + 1) ^${format(player.inflation.vacuum ? 0.22 : 0.18)} | Effect: ${format(global.strangeInfo.stageBoost[2], { padding: true })})`,
                () => `Submerged Structures that improve other Submerged Structures will do it ${format(1.24)} times stonger.\n(Affected Structures are Ponds, Lakes, Seas and Oceans)`,
                () => { //[8]
                    let extraText = 'none';
                    if (player.strangeness[2][8] >= 1) { extraText = "max level increased for 'Stronger surface tension' (+3)"; }
                    if (player.strangeness[2][8] >= 2) { extraText += " and 'Stronger surface stress' (+1)"; }
                    if (player.strangeness[2][8] >= 3) { extraText += ", a new Upgrade ‒ 'Tide'"; }
                    return `Increase max level for one of Researches. Final level will instead unlock an even better new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => `Increase Stage reset reward based on current Cloud amount.\n(Formula: log10(Clouds + 1) / 80 + 1 | Effect: ${format(calculateEffects.S2Strange9(), { padding: true })})`
            ],
            cost: [],
            startCost: [1, 1, 2, 2, 12, 4, 24, 36, 1200, 9600],
            scaling: [2.46, 2, 3, 3.4, 800, 1, 1, 3.4, 3, 1],
            max: [4, 8, 3, 2, 1, 1, 1, 6, 3, 1],
            maxActive: 7
        }, { //Stage 3
            name: [
                'Faster Accretion',
                'Intense weathering',
                'More levels',
                'Improved Satellites',
                'Automatic Rank',
                'Auto Structures',
                'Upgrade automatization',
                'Strange boost',
                'Mass delay',
                'Rank raise'
            ],
            effectText: [
                () => `Increase strength of Cosmic dust by ${format(1.8)}.`,
                () => `Accretion Structures that produce other Accretion Structures will do it ${format(player.inflation.vacuum ? 1.48 : 1.6)} times faster.\n(Affected Structures are Planetesimals and Protoplanets)`,
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[3][2] >= 1) { extraText = "max level increased for 'Rank boost' (+6)"; }
                    if (player.strangeness[3][2] >= 2) { extraText += " and 'Efficient growth' (+2)"; }
                    if (player.strangeness[3][2] >= 3) { extraText += ", a new Upgrade ‒ 'Hydrostatic equilibrium'"; }
                    return `Increase max level for one of the Rank Researches. Final level will instead unlock a new Upgrade.\n(Current effect: ${extraText})`;
                },
                () => { //[3]
                    if (!global.stageInfo.activeAll.includes(3)) { assignBuildingsProduction.stage3Cache(); }
                    return `Satellites will be able to improve remaining ${player.inflation.vacuum ? 'Accretion ' : ''} Structures, but at reduced strength (^${format(player.inflation.vacuum ? 0.1 : 0.2)}).\n(Affected Structures are Cosmic dust and Planetesimals, boost is equal to ${format(effectsCache.S3Strange3, { padding: true })})`;
                },
                () => `Automatically increase Rank when possible. (Need to be enabled in Settings)${global.strangenessInfo[3].max[4] > 1 ? '\nSecond level will make Rank increase use Mass produced this reset instead of current.' : ''}`,
                () => 'Make auto for all Accretion Structures permanent.',
                () => `Always automatically create all ${['Upgrades', 'Stage Researches', 'Special Researches'][Math.min(player.strangeness[3][6], 2)]} from any Stage${!player.inflation.vacuum && player.strangeness[5][3] < 1 && player.buildings[6][1].current.lessThan('3') ? ' before Intergalactic' : ''}. (Need to be enabled in Settings)`,
                () => `Unspent Strange quarks will boost Accretion by making its Structures cheaper.\n(Formula: (x + 1) ^${format(player.inflation.vacuum ? 0.68 : 0.76)} | Effect: ${format(global.strangeInfo.stageBoost[3], { padding: true })})`,
                () => `Delay Cosmic dust hardcap by ${format(1.4)} per level.`,
                () => `Unlock a new Accretion Rank to achieve.${player.stage.true >= 7 ? "\n(Also increase max level of 'Reset automatization')" : ''}`
            ],
            cost: [],
            startCost: [1, 2, 2, 24, 12, 4, 4, 24, 9600, 1.8e6],
            scaling: [2, 3.4, 3, 1, 100, 1, 1.74, 1, 2.46, 1],
            max: [8, 4, 3, 1, 1, 1, 3, 1, 6, 1],
            maxActive: 8
        }, { //Stage 4
            name: [
                'Hotter Stars',
                'Cheaper Stars',
                'New Upgrade',
                'Main giants',
                'Automatic Collapse',
                'Auto Structures',
                'Element automatization',
                'Strange boost',
                'Neutronium',
                'Newer Upgrade'
            ],
            effectText: [
                () => `All Stars will produce ${format(1.6)} times more Elements.`,
                () => 'Stars will be 2 times cheaper.',
                () => { //[2]
                    let extraText = 'none';
                    if (player.strangeness[4][2] >= 1) { extraText = "'Planetary nebula' (Stage Research)"; }
                    if (player.strangeness[4][2] >= 2) { extraText += ", 'White dwarfs' (Collapse Research)"; }
                    if (player.strangeness[4][2] >= 3) { extraText += ", 'Helium fusion' (Upgrade)"; }
                    return `Unlock a new Upgrade, its pretty good.\n(Current unlocks: ${extraText})`;
                },
                () => '10% of Brown dwarfs will be able to turn into Red giants after Collapse.',
                () => `Automatically Collapse once reached enough boost or Solar mass. (Need to be enabled in Settings)${global.strangenessInfo[4].max[4] > 1 ? '\nSecond level will allow to automatically gain Star remnants without needing to reset.' : ''}`,
                () => 'Make auto for all Interstellar Structures permanent.',
                () => `Elements will no longer require Collapse for activation${player.inflation.vacuum ? ' and related automatization Research will cost as if its level is -1' : ''}.\nSecond level will unlock auto creation of Elements. (${global.strangenessInfo[4].max[6] > 1 ? 'Need to be enabled in settings' : 'Not yet unlocked for Interstellar space'})`,
                () => `Unspent Strange quarks will boost Interstellar by improving all Stars.\n(Formula: (x + 1) ^(${format(0.16)} or ${format(0.32)}, if '[26] Iron' is created) | Effect: ${format(global.strangeInfo.stageBoost[4], { padding: true })})`,
                () => `Increase effective amount of Neutron stars (doesn't include ones from '[22] Titanium') by 1 + level and improve Neutron stars strength by +^${format(0.125)}.`,
                () => { //[9]
                    let extraText = 'none';
                    if (player.strangeness[4][9] >= 1) { extraText = "'Nucleosynthesis' (Upgrade)"; }
                    if (player.strangeness[4][9] >= 2) { extraText += ", 'Quark-nova' (Collapse Research)"; }
                    if (player.strangeness[4][9] >= 3) { extraText += ", 'Inner Black hole' (Stage Research)"; }
                    return `Unlock yet another an even better new Upgrade.\n(Current unlocks: ${extraText})`;
                }
            ],
            cost: [],
            startCost: [1, 2, 4, 2, 12, 6, 6, 24, 6400, 2e5],
            scaling: [2, 3.4, 3, 6, 1900, 1, 1.74, 1, 2, 3],
            max: [8, 4, 3, 2, 1, 1, 1, 1, 8, 3],
            maxActive: 8
        }, { //Stage 5
            name: [
                'Bigger Structures',
                'Higher density',
                'Strange gain',
                'Gravitational bound',
                'Automatic Galaxy',
                'Auto Structures',
                'Automatic Stage',
                'Strange boost',
                'Strange growth',
                'Automatic Merge',
                'Galactic tide'
            ],
            effectText: [
                () => `More matter for Accretion (flavor text), first two Intergalactic Structures will be ${format(player.inflation.vacuum ? 1.4 : 1.6)} times stronger.`,
                () => `With higher density first two Intergalactic upgrades will be even stronger. Effects will be increased by ${format(player.inflation.vacuum ? 1.6 : 1.8)}.`,
                () => `Gain ${format(1.4)} times more Strange quarks from any Stage reset.`,
                () => player.inflation.vacuum ? 'Unlock Intergalactic Stage and increase Strange quarks from Stage resets by +1.' : `Will make Intergalactic Stage immune to Collapse reset${player.buildings[6][1].current.lessThan('3') ? " and allow 'Upgrade automatization' to work within Intergalactic Stage" : ''}.`,
                () => 'Automatically Collapse if will be able to afford new Galaxy and auto Galaxy is enabled.\n(Also unlocks permanent auto Galaxies for free and removes Mass limit for Collapse points)',
                () => `Make auto for ${player.strangeness[5][4] >= 1 ? 'all' : 'the first two'} Intergalactic Structures permanent${player.strangeness[5][4] < 1 ? ' and prevent rest from resetting' : ''}.`,
                () => `Automatically trigger Stage reset${!player.inflation.vacuum ? ", doesn't work for Interstellar Stage until second level" : ''}. (Need to be enabled in Settings)`,
                () => `Unspent Strange quarks will boost Intergalactic by increasing Solar mass gain.\n(Formula: (x + 1) ^${format(0.06)} | Effect: ${format(global.strangeInfo.stageBoost[5], { padding: true })})`,
                () => 'Unlock another Strange Structure.\n(Click on that Structure to see its effects)',
                () => 'Automatically Merge Galaxies if possible. (Need to be enabled in Settings)',
                () => { //[10]
                    let passive = 'none';
                    let upgrades = 'none';
                    if (player.strangeness[5][10] >= 1) {
                        passive = `increase Energy gain from Galaxies by 5, decrease Discharge goal requirement by ${format(calculateEffects.S5Strange9_stage1(), { padding: 'exponent' })}`;
                        upgrades = "'Nuclear fission' (Microworld Upgrade), 'Radioactive decay' (Energy Research)";
                    }
                    if (player.strangeness[5][10] >= 2) {
                        passive += `, boost Puddles and pre Puddles Rain effect${player.strangeness[5][10] >= 3 ? ', and Cosmic dust strength' : ''} by ${format(calculateEffects.S5Strange9_stage2(), { padding: 'exponent' })}`;
                        upgrades += ", 'Jeans Mass' (Clouds Research)";
                    }
                    if (player.strangeness[5][10] >= 3) {
                        passive += `, delay Cosmic dust hardcap by ${format(calculateEffects.S5Strange9_stage3(), { padding: true })}`;
                        upgrades += ", 'Self-gravity' (Accretion Upgrade), 'Ablative armor' (Rank Research)";
                    }
                    return `Boost lower Stages based on current Galaxies and unlock new Upgrades for them.\n(Passive effects: ${passive})\n(New Upgrades: ${upgrades})`;
                }
            ],
            cost: [],
            startCost: [24, 36, 6, 24, 15600, 24, 240, 120, 6000, 4e6, 8e6],
            scaling: [2, 2, 3.4, 1, 1, 1, 1, 1, 1, 1, 3],
            max: [8, 8, 2, 1, 1, 1, 1, 1, 1, 1, 3],
            maxActive: 8
        }
    ],
    inflationTreeInfo: {
        name: [
            'Overboost',
            'Global boost',
            'Strange gain',
            'Instability',
            'Void Milestones',
            'Discharge improvement',
            'Indestructible matter'
        ],
        effectText: [
            () => `Boost global speed by 2, but reduce time limit on everything that has it by 4 if level is below 2.\nIf there is no time limit then 2nd level will instead boost global speed by ${format(calculateEffects.inflation0(), { padding: true })} (strength depletes over ${format(1200, { type: 'time', padding: false })} of real Stage time).`,
            () => { //[1]
                const power = calculateEffects.inflation1_power();
                return `Boost global speed by (unspent Dark matter + 1) ^${format(power, { padding: true })}.\n(Boost per level: ${format(calculateEffects.inflation1(calculateEffects.inflation1_power(player.inflation.tree[1] + 1) - power), { padding: true })})`;
            },
            () => `Gain ${format(1.4)} times more Strange quarks from any Stage reset per level.${player.inflation.tree[3] >= 1 ? `\nFirst ${player.inflation.tree[3] * 2} levels will also boost global speed by ${format(1.2)} while inside Void.` : ''}`,
            () => `Boost global speed and Stage reset reward by ${format(calculateEffects.inflation3())}. This Inflation strength is based on Supervoid progress.\nEvery level will also improve 2 levels of 'Strange gain' Inflation to boost global speed while inside the Void.`,
            () => 'For false Vacuum it will remove time limit from Milestones.\nFor true Vacuum it will unlock Void Milestones, but reduce time limit and multiply global speed by 3 while inside normal Void.\nEffects are active anywhere in true Vacuum as long as this Inflation is active.',
            () => `True Vacuum only, improve Discharge base by +${format(0.5)}, gain +1 free Goals and decrease requirement scaling by -1 per level.\n(Activating this Inflation will make next Discharge goal to be ${format(calculateEffects.dischargeCost(calculateEffects.dischargeScaling(undefined, undefined, player.inflation.tree[5] + 1)))} Energy)`,
            () => 'Make self-made Preons immune to basic resets.'
        ],
        cost: [],
        startCost: [0, 1, 1, 2, 4, 0, 80],
        scaling: [2, 0.75, 0.5, 2, 0, 80, 0],
        max: [2, 6, 8, 4, 1, 2, 1],
        refundable: [true, true, true, true, true, false, false]
    },
    milestonesInfo: [
        {} as globalType['milestonesInfo'][0], { //Stage 1
            name: [
                'Fundamental Matter',
                'Energized'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[1].need[0])} ${player.inflation.vacuum ? 'Preons' : 'Quarks'} this reset.`,
                () => `Have current Energy reach ${format(global.milestonesInfo[1].need[1])}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `All Microworld Structures strength increased by ${format(global.milestonesInfo[1].reward[0], { padding: true })}.` : 'Increase base for Strange quarks from any Stage reset by +1.',
                () => player.inflation.vacuum ? `Effective Energy increased by ${format(global.milestonesInfo[1].reward[1], { padding: true })}.` : 'Permanent Microworld Stage.'
            ],
            need: [],
            time: [14400, 14400],
            reward: [1, 1],
            scaling: [
                [1e152, 1e158, 1e164, 1e170, 1e178, 1e190],
                [23800, 24600, 25800, 27000, 28200, 29600]
            ],
            max: [6, 6]
        }, { //Stage 2
            name: [
                'A Nebula of Drops',
                'Just a bigger Puddle'
            ],
            needText: [
                () => `${player.inflation.vacuum ? 'Vaporize to' : 'Produce'} at least ${format(global.milestonesInfo[2].need[0])} ${player.inflation.vacuum ? 'Clouds' : 'Drops this reset'}.`,
                () => `${player.inflation.vacuum ? 'Produce' : 'Have'} at least ${format(global.milestonesInfo[2].need[1])} ${player.inflation.vacuum ? 'Drops this reset' : 'Puddles at same time'}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Decrease Drops requirement to get a Cloud by ${format(global.milestonesInfo[2].reward[0], { padding: true })}.` : 'First Intergalactic Structure. (Nebula)',
                () => player.inflation.vacuum ? `Puddles strength increased by ${format(global.milestonesInfo[2].reward[1], { padding: true })}.` : 'Permanent Submerged Stage.'
            ],
            need: [],
            time: [28800, 28800],
            reward: [1, 1],
            scaling: [
                [1e30, 1e32, 1e34, 1e36, 1e38, 1e40, 1e44],
                [1500, 2300, 3100, 3900, 4700, 5500, 6400]
            ],
            max: [7, 7]
        }, { //Stage 3
            name: [
                'Cluster of Mass',
                'Satellites of Satellites'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[3].need[0])} Mass this reset.`,
                () => `Have more or equal to ${format(global.milestonesInfo[3].need[1])} Satellites${player.inflation.vacuum ? ' and Subsatellites' : ''}.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `Cosmic dust strength increased by ${format(global.milestonesInfo[3].reward[0], { padding: true })}.` : 'Second Intergalactic Structure. (Star cluster)',
                () => player.inflation.vacuum ? `Increase effective Rank by +${format(global.milestonesInfo[3].reward[1])}.` : 'Permanent Accretion Stage.'
            ],
            need: [],
            time: [43200, 43200],
            reward: [1, 0],
            scaling: [
                [1e32, 1e34, 1e36, 1e38, 1e40, 1e42, 1e45],
                [24, 28, 32, 36, 40, 44, 50]
            ],
            max: [7, 7]
        }, { //Stage 4
            name: [
                'Remnants of past',
                'Supermassive'
            ],
            needText: [
                () => `Produce at least ${format(global.milestonesInfo[4].need[0])} Elements this reset.`,
                () => `Have ${player.inflation.vacuum ? 'current Black holes' : 'Solar mass after Collapse'} reach ${format(global.milestonesInfo[4].need[1])} or more.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `All Stars strength increased by ${format(global.milestonesInfo[4].reward[0], { padding: true })}.` : "New Intergalactic themed Strangeness, Milestone and second level of 'Element automatization'.",
                () => player.inflation.vacuum ? `Black holes effect increased by ${format(global.milestonesInfo[4].reward[1], { padding: true })}.` : 'Research to make third Intergalactic Structure and the final Milestone. (Galaxy)'
            ],
            need: [],
            time: [57600, 57600],
            reward: [1, 1],
            scaling: [
                [1e48, 1e49, 1e50, 1e52, 1e54, 1e56, 1e58, 1e60],
                [9000, 12000, 16000, 22000, 30000, 42000, 60000, 84000]
            ],
            max: [8, 8]
        }, { //Stage 5
            name: [
                'Light in the dark',
                'End of Greatness'
            ],
            needText: [
                () => `Have ${player.inflation.vacuum ? 'total produced' : 'self-made'} Stars ${player.inflation.vacuum ? 'this reset' : 'count'} reach at least ${format(global.milestonesInfo[5].need[0])}.`,
                () => `Have ${format(global.milestonesInfo[5].need[1])} ${player.inflation.vacuum ? 'self-made ' : ''}Galaxies or more.`
            ],
            rewardText: [
                () => player.inflation.vacuum ? `First two Intergalactic Structures strength increased by ${format(global.milestonesInfo[5].reward[0], { padding: true })}.` : "Unlock a new Intergalactic Strangeness 'Strange gain' and second level of 'Automatic Stage'.",
                () => player.inflation.vacuum ? `Boost per Galaxy is increased by +${format(global.milestonesInfo[5].reward[1])}.` : "Unlock a new Intergalactic Upgrade 'Galactic Merger'."
            ],
            need: [],
            time: [3600, 1200],
            reward: [1, 0],
            scaling: [
                [1460, 1540, 1620, 1700, 1780, 1860, 1940, 2020],
                [1, 2, 4, 6, 10, 14, 18, 22]
            ],
            max: [8, 8]
        }
    ],
    challengesInfo: [{
        name: 'Void',
        description: () => `Result of Vacuum Instability, investigate at your own will\n(${player.inflation.vacuum || player.challenges.super ? `Entering will force a ${player.challenges.super ? 'Vacuum' : 'Stage'} reset, will be reverted after exiting` : 'No reason to enter from false Vacuum'}${player.inflation.vacuum ? '' : '. All rewards are disabled'})`,
        effectText: () => {
            const progress = player.challenges.voidCheck;
            let text = `<p class="orangeText">‒ Microworld Structures are 4 times weaker${progress[1] >= 1 ? `\n‒ Discharge base is raised to the root of 2 (^${format(0.5)})` : ''}${progress[1] >= 2 ? '\n‒ Energy gain from Submerged and Accretion Stages is divided by 2' : ''}\n${progress[3] >= 5 ? '‒ Energy gain from Interstellar and Intergalactic Stages is divided by 4' : 'More nerfs will be shown with more rewards'}</p>`;
            if (progress[1] >= 3) { text += `<p class="blueText">‒ Effective Drops amount is hardcapped at 1\n‒ Puddles are ${format(8000)} times weaker\n${progress[2] >= 1 ? `‒ Clouds gain is decreased by ^${format(0.8)}` : 'More nerfs will be shown with more rewards'}</p>`; }
            if (progress[1] >= 2) { text += `<p class="grayText">‒ Cosmic dust is softcapped (^${format(0.9)})${progress[3] >= 4 ? `\n‒ Softcap is stronger after reaching 'Jovian planet' Rank (^${format(0.8)})` : 'More nerfs will be shown with more rewards'}</p>`; }
            if (progress[3] >= 5) { text += `<p class="orchidText">‒ Stars are ${format(8000)} times weaker${progress[4] >= 1 ? '\n‒ Solar mass gain is 2 times smaller' : ''}${progress[4] >= 2 ? `\n‒ Solar mass effect is softcapped ^${format(0.2)} after 1` : ''}\n${progress[4] >= 5 ? "‒ Can't create or gain Quasi-stars" : 'More nerfs will be shown with more rewards'}</p>`; }
            if (progress[2] >= 1) { text += `<p class="cyanText">${player.challenges.super ? '‒ Global speed is divided by 5\n' : ''}‒ All resets affect all Stages${progress[5] >= 1 ? `\n‒ Galaxies cost scaling increased by +${format(0.05)}` : progress[4] >= 5 ? '\nMore nerfs will be shown with more rewards' : ''}</p>`; }
            return text;
        },
        needText: [
            [], [
                () => 'Perform Discharge',
                () => "Get first level of 'Accretion'",
                () => "Get second level of 'Accretion'"
            ], [
                () => 'Have more than 0 Clouds',
                () => `Have more than ${format(1e4)} Clouds`,
                () => player.stage.true >= 7 ? `Reach ${format(1e12)} Clouds without increasing Rank` : 'Requirements are unknown'
            ], [
                () => "Reach 'Meteoroid' Rank",
                () => "Reach 'Asteroid' Rank",
                () => "Reach 'Planet' Rank",
                () => "Reach 'Jovian planet' Rank",
                () => "Reach 'Protostar' Rank",
                () => player.stage.true >= 7 ? "Reach 'Protogalaxy' Rank" : 'Requirements are unknown'
            ], [
                () => 'Cause the Collapse',
                () => 'Get first Red giant',
                () => 'Get first Neutron star',
                () => 'Get first Black hole',
                () => 'Unlock Intergalactic'
            ], [
                () => 'Create a Galaxy',
                () => player.stage.true >= 7 ? 'Force Galaxies to Merge (WIP)' : 'Requirements are unknown',
                () => player.stage.true >= 7 ? 'Create a Galaxy group (WIP)' : 'Requirements are unknown'
            ]
        ],
        rewardText: [[
            [],
            ["'Energy increase' (Microworld)", "'Conservation of Mass' (Microworld)", "'Improved flow' (Submerged)"],
            ["'Mechanical spread' (Submerged)", "'Ocean world' (Submerged)", "'Galactic tide' (Intergalactic)"],
            ['Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', 'Multiple max level increases', "'Strange growth' (Intergalactic)", "'Automatic Merge' (Intergalactic)"],
            ['Max level increased for Auto resets', "'Conservation of Energy' (Microworld)", "'Neutronium' (Interstellar)", "'Mass delay' (Accretion)", "'Newer Upgrade' (Interstellar)"],
            ["'Rank raise' (Accretion)", 'Missing', 'Missing']
        ], [
            [],
            ["'Discharge improvement' (Non refundable)", "'Improved conservation' (Milestone)", 'Missing'],
            ['Missing', 'Missing', 'Missing'],
            ["'Indestructible matter' (Non refundable)", 'Missing', 'Missing', 'Missing', 'Missing', 'Missing'],
            ['Missing', 'Missing', 'Missing', 'Missing', 'Missing'],
            ['Missing', 'Missing', 'Missing']
        ]],
        resetType: 'stage',
        time: 3600,
        color: 'darkviolet'
    }, {
        name: 'Vacuum information',
        resetType: 'vacuum',
        time: 1200,
        color: 'darkorchid'
    }],
    historyStorage: {
        stage: [],
        vacuum: []
    }
};

/** Only for effects that are calculated multiple times per tick */
export const effectsCache = { //Cannot be in Stage.ts due to esbuild file ordering
    microworld: 0,
    S1Upgrade6: 0,
    S1Upgrade7: 0,
    /** Alternative names are S1Upgrade8 and S1Build6 */
    tritium: new Overlimit('0'),
    S2Upgrade3: 0,
    S2Upgrade4: 0,
    interstellar: 0,
    mass: 0,
    star1: 0,
    galaxyBase: 0,
    S5Upgrade2: 0,
    element26: 0,
    S1SolarDelay: 0,
    S3SolarDelay: 0,
    S3Strange1: 0,
    S2Strange9: 0,
    S3Strange3: 0
};

//Math.log extension for any base
export const logAny = (number: number, base: number) => Math.log(number) / Math.log(base);

/** Not for deep copy, works on Overlimit, but not prefered */
export const cloneArray = <ArrayClone extends Array<number | string | boolean | null | undefined>>(array: ArrayClone) => array.slice(0) as ArrayClone;
//Actual type is any[], it's because TS is dumb; [...array] will be better after ~>10000 keys

/** For non deep clone use { ...object } or cloneArray when possible */
export const deepClone = <CloneType>(toClone: CloneType): CloneType => {
    if (typeof toClone !== 'object' || toClone === null) { return toClone; }

    let value: any;
    if (Array.isArray(toClone)) {
        if (toClone instanceof Overlimit) { return new Overlimit(toClone) as CloneType; }

        value = []; //Faster this way
        for (let i = 0; i < toClone.length; i++) { value.push(deepClone(toClone[i])); }
    } else {
        value = {};
        for (const check in toClone) { value[check] = deepClone(toClone[check]); }
    }
    return value;
};

/** Does not clone given value */
export const createArray = <startValue extends number | string | boolean | null | undefined>(length: number, value: startValue) => {
    const array = [];
    for (let i = 0; i < length; i++) {
        array.push(value);
    }
    return array as startValue[];
};

for (let s = 0; s < global.buildingsInfo.startCost.length; s++) {
    global.buildingsInfo.producing[s] = [];
    for (let i = 0; i < global.buildingsInfo.startCost[s].length; i++) {
        global.buildingsInfo.producing[s].push(new Overlimit('0'));
    }
}
for (let s = 2; s < global.upgradesInfo.length; s++) {
    const startCost = global.upgradesInfo[s].startCost;
    for (let i = 0; i < startCost.length; i++) { startCost[i] = new Overlimit(startCost[i]); }
}
for (const upgradeType of ['researches', 'researchesExtra'] as const) {
    const pointer = global[`${upgradeType}Info`];
    pointer[1].cost = cloneArray(pointer[1].startCost as number[]);
    for (let s = 2; s < pointer.length; s++) {
        for (let i = 0; i < pointer[s].startCost.length; i++) {
            pointer[s].startCost[i] = new Overlimit(pointer[s].startCost[i]);
            pointer[s].cost[i] = new Overlimit(pointer[s].startCost[i]);
        }
    }
}
{
    const startCost = global.elementsInfo.startCost;
    for (let i = 1; i < startCost.length; i++) { startCost[i] = new Overlimit(startCost[i]); }
}
for (let s = 1; s < global.strangenessInfo.length; s++) {
    global.strangenessInfo[s].cost = cloneArray(global.strangenessInfo[s].startCost);
}
for (let s = 1; s < global.milestonesInfo.length; s++) {
    for (let i = 0; i < global.milestonesInfo[s].needText.length; i++) {
        global.milestonesInfo[s].need.push(new Overlimit('Infinity'));
    }
}
global.inflationTreeInfo.cost = cloneArray(global.inflationTreeInfo.startCost);

Object.assign(player, {
    upgrades: [
        [],
        createArray(global.upgradesInfo[1].startCost.length, 0),
        createArray(global.upgradesInfo[2].startCost.length, 0),
        createArray(global.upgradesInfo[3].startCost.length, 0),
        createArray(global.upgradesInfo[4].startCost.length, 0),
        createArray(global.upgradesInfo[5].startCost.length, 0),
        createArray(global.upgradesInfo[6].startCost.length, 0)
    ],
    researches: [
        [],
        createArray(global.researchesInfo[1].startCost.length, 0),
        createArray(global.researchesInfo[2].startCost.length, 0),
        createArray(global.researchesInfo[3].startCost.length, 0),
        createArray(global.researchesInfo[4].startCost.length, 0),
        createArray(global.researchesInfo[5].startCost.length, 0),
        createArray(global.researchesInfo[6].startCost.length, 0)
    ],
    researchesExtra: [
        [],
        createArray(global.researchesExtraInfo[1].startCost.length, 0),
        createArray(global.researchesExtraInfo[2].startCost.length, 0),
        createArray(global.researchesExtraInfo[3].startCost.length, 0),
        createArray(global.researchesExtraInfo[4].startCost.length, 0),
        createArray(global.researchesExtraInfo[5].startCost.length, 0),
        createArray(global.researchesExtraInfo[6].startCost.length, 0)
    ],
    researchesAuto: createArray(global.researchesAutoInfo.costRange.length, 0),
    ASR: createArray(global.ASRInfo.costRange.length, 0),
    maxASR: createArray(global.ASRInfo.costRange.length, 0),
    elements: createArray(global.elementsInfo.startCost.length, 0),
    strangeness: [
        [],
        createArray(global.strangenessInfo[1].startCost.length, 0),
        createArray(global.strangenessInfo[2].startCost.length, 0),
        createArray(global.strangenessInfo[3].startCost.length, 0),
        createArray(global.strangenessInfo[4].startCost.length, 0),
        createArray(global.strangenessInfo[5].startCost.length, 0)
    ],
    milestones: [
        [],
        createArray(global.milestonesInfo[1].need.length, 0),
        createArray(global.milestonesInfo[2].need.length, 0),
        createArray(global.milestonesInfo[3].need.length, 0),
        createArray(global.milestonesInfo[4].need.length, 0),
        createArray(global.milestonesInfo[5].need.length, 0)
    ]
});
Object.assign(player.toggles, {
    normal: createArray(document.getElementsByClassName('toggleNormal').length, false),
    confirm: createArray(document.getElementsByClassName('toggleConfirm').length, 'Safe'),
    buildings: [
        [],
        createArray(player.buildings[1].length, false),
        createArray(player.buildings[2].length, false),
        createArray(player.buildings[3].length, false),
        createArray(player.buildings[4].length, false),
        createArray(player.buildings[5].length, false),
        createArray(player.buildings[6].length, false)
    ],
    hover: createArray(document.getElementsByClassName('toggleHover').length, false),
    max: createArray(document.getElementsByClassName('toggleMax').length, false),
    auto: createArray(document.getElementsByClassName('toggleAuto').length, false)
});
player.inflation.tree = createArray(global.inflationTreeInfo.startCost.length, 0);
player.toggles.normal[1] = true;

//player.example = playerStart.example; Is not allowed (if example is an array or object), instead iterate or create clone
export const playerStart = deepClone(player);

export const updatePlayer = (load: playerType): string => {
    if (load.inflation === undefined) { throw new ReferenceError('This save file is not from this game or too old'); }
    prepareVacuum(load.inflation.vacuum); //Only to set starting buildings values

    const oldVersion = load.version;
    if (oldVersion !== playerStart.version) {
        if (load.version === 'v0.1.2') {
            load.version = 'v0.1.3';
            load.stage.time = 0;
            load.inflation.age = 0;
            load.discharge.energyMax = load.discharge.energy;
            load.vaporization.cloudsMax = new Overlimit(load.vaporization.clouds);
        }
        if (load.version === 'v0.1.3' || load.version === 'v0.1.4' || load.version === 'v0.1.5') {
            load.version = 'v0.1.6';
            load.challenges = deepClone(playerStart.challenges);
            delete load.time['disabled' as keyof unknown];
            delete load.discharge['unlock' as keyof unknown];
            delete load.collapse['disabled' as keyof unknown];
            delete load.collapse['inputM' as keyof unknown];
            delete load.collapse['inputS' as keyof unknown];
        }
        if (load.version === 'v0.1.6' || load.version === 'v0.1.7') {
            load.version = 'v0.1.8';
            load.time.online = load.inflation.age;
            load.time.universe = load.inflation.age;
            load.time.stage = load.stage.time;
            if (load.buildings[5].length > 4) { load.buildings[5].length = 4; }
            delete load['saveUpdate016' as keyof unknown];
            delete load.accretion['input' as keyof unknown];
            delete load.collapse['elementsMax' as keyof unknown];
        }
        if (load.version === 'v0.1.8') {
            load.version = 'v0.1.9';
            load.researchesAuto = cloneArray(playerStart.researchesAuto);
            delete load.discharge['bonus' as keyof unknown];
        }
        if (load.version === 'v0.1.9') {
            load.version = 'v0.2.0';
            load.stage.peak = 0;
            load.milestones = deepClone(playerStart.milestones);
            load.vaporization.input = cloneArray(playerStart.vaporization.input);
            load.time.export = cloneArray(playerStart.time.export);
            load.history = deepClone(playerStart.history);
            load.fileName = playerStart.fileName;
            delete load['separator' as keyof unknown];
            delete load['intervals' as keyof unknown];
            delete load.stage['best' as keyof unknown];
            delete load.stage['export' as keyof unknown];
        }
        if (load.version === 'v0.2.0') {
            load.version = 'v0.2.1';
            load.time.offline = 0;
            load.toggles = deepClone(playerStart.toggles);
            load.stage.input = cloneArray(playerStart.stage.input);
            load.merge = deepClone(playerStart.merge);
            load.cosmon = deepClone(playerStart.cosmon);
            load.inflation.resets = load.inflation.vacuum ? 1 : 0;
            load.buildings[6] = deepClone(playerStart.buildings[6]);
            load.upgrades[6] = cloneArray(playerStart.upgrades[6]);
            load.researches[6] = cloneArray(playerStart.researches[6]);
            load.researchesExtra[6] = cloneArray(playerStart.researchesExtra[6]);
            load.collapse.input = cloneArray(playerStart.collapse.input);
            load.challenges.voidCheck = cloneArray(load.challenges.void);
            load.history.vacuum = deepClone(playerStart.history.vacuum);
            for (let s = 1; s <= 5; s++) {
                for (let i = 0; i < load.buildings[s].length; i++) {
                    delete load.buildings[s][i]['highest' as keyof unknown];
                }
            }

            /* Can be removed eventually */
            load.strangeness[5].splice(6, 0, load.strangeness[5].splice(2, 1)[0]);
            load.strangeness[5].splice(3, 0, load.strangeness[5].splice(1, 1)[0]);
            load.strangeness[5].splice(0, 1);
            load.strangeness[5].splice(4, 0, 0);
        }
        if (load.version === 'v0.2.1') {
            load.version = 'v0.2.2';
            load.event = load.stage.true >= 7;
            load.challenges.active = null;
            load.collapse.show = load.elements.findLastIndex((e) => e > 0);
            load.collapse.maxElement = load.collapse.show;
            load.collapse.points = [];
            load.inflation.tree = cloneArray(playerStart.inflation.tree);
            load.merge.reward = cloneArray(playerStart.merge.reward);
            load.merge.input = 0;
            load.clone = {};
            delete load['events' as keyof unknown];

            /* Can be removed eventually */
            const vacuumHistory = load.history.vacuum;
            const vacuumList = vacuumHistory.list;
            for (let i = 0; i < vacuumList.length; i++) {
                const test = vacuumList[i + 1];
                if (vacuumList[i][1] && test !== undefined && !test[1]) { vacuumList[i][0] -= test[0]; }
                if (vacuumList[i][2] / vacuumList[i][0] > vacuumHistory.best[2] / vacuumHistory.best[0]) { vacuumHistory.best = cloneArray(vacuumList[i]); }
            }
            const minus = vacuumList.length > 0 && !vacuumList[0][1] ? vacuumList[0][0] : 0;
            load.inflation.time = load.inflation.age - minus; //Shorten
            load.time.vacuum = load.time.universe - minus; //Shorten
            load.cosmon.current = load.cosmon.total;
        }
        if (load.version === 'v0.2.2') {
            load.version = 'v0.2.3';
            load.challenges.super = false;
            load.challenges.supervoid = cloneArray(playerStart.challenges.supervoid);
            load.inflation.spent = load.cosmon.total - load.cosmon.current;

            /* Can be removed eventually */
            const pointer = load.clone.depth === 'vacuum' ? load.clone : load;
            if (pointer.inflation.vacuum === true) { pointer.milestones = deepClone(playerStart.milestones); }
            if (pointer.challenges.voidCheck[5] >= 1) {
                pointer.challenges.voidCheck[4] = 5;
                pointer.challenges.voidCheck[5]--;
            }
            if (pointer.challenges.void[5] >= 1) {
                pointer.challenges.void[4] = 5;
                pointer.challenges.void[5]--;
            }
        }

        if (load.version !== playerStart.version) {
            throw new ReferenceError(`Couldn't update save file ${load.version} to current game version`);
        }
    }

    for (let s = 1; s <= 6; s++) {
        for (let i = Math.min(load.buildings[s].length, global.buildingsInfo.maxActive[s]); i < playerStart.buildings[s].length; i++) {
            load.buildings[s][i] = deepClone(playerStart.buildings[s][i]);
        }
        for (let i = load.toggles.buildings[s].length; i < playerStart.toggles.buildings[s].length; i++) {
            load.toggles.buildings[s][i] = false;
        }
        if (load.stage.true < 3 || !(load.toggles.shop.wait[s] >= 1)) { load.toggles.shop.wait[s] = 2; }

        for (let i = load.upgrades[s].length; i < playerStart.upgrades[s].length; i++) {
            load.upgrades[s][i] = 0;
        }
        for (let i = load.researches[s].length; i < playerStart.researches[s].length; i++) {
            load.researches[s][i] = 0;
        }
        for (let i = load.researchesExtra[s].length; i < playerStart.researchesExtra[s].length; i++) {
            load.researchesExtra[s][i] = 0;
        }
        if (load.ASR[s] === undefined) { load.ASR[s] = 0; }

        if (s >= 6) { continue; }
        for (let i = Math.min(load.strangeness[s].length, global.strangenessInfo[s].maxActive); i < playerStart.strangeness[s].length; i++) {
            load.strangeness[s][i] = 0;
        }
        for (let i = load.milestones[s].length; i < playerStart.milestones[s].length; i++) {
            load.milestones[s][i] = 0;
        }
    }
    for (let i = load.strange.length; i < playerStart.strange.length; i++) {
        load.strange[i] = deepClone(playerStart.strange[i]);
    }

    for (let i = load.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
        load.researchesAuto[i] = 0;
    }
    for (let i = load.elements.length; i < playerStart.elements.length; i++) {
        load.elements[i] = 0;
    }
    for (let i = load.inflation.tree.length; i < playerStart.inflation.tree.length; i++) {
        load.inflation.tree[i] = 0;
    }
    if (load.clone.depth !== undefined) {
        const { clone } = load;
        for (let s = 1; s <= 6; s++) {
            for (let i = clone.upgrades[s].length; i < playerStart.upgrades[s].length; i++) {
                clone.upgrades[s][i] = 0;
            }
            for (let i = clone.researches[s].length; i < playerStart.researches[s].length; i++) {
                clone.researches[s][i] = 0;
            }
            for (let i = clone.researchesExtra[s].length; i < playerStart.researchesExtra[s].length; i++) {
                clone.researchesExtra[s][i] = 0;
            }

            if (clone.depth === 'stage' || s >= 6) { continue; }
            for (let i = clone.strangeness[s].length; i < playerStart.strangeness[s].length; i++) {
                clone.strangeness[s][i] = 0;
            }
            for (let i = clone.milestones[s].length; i < playerStart.milestones[s].length; i++) {
                clone.milestones[s][i] = 0;
            }
        }
        for (let i = clone.researchesAuto.length; i < playerStart.researchesAuto.length; i++) {
            clone.researchesAuto[i] = 0;
        }
        for (let i = clone.elements.length; i < playerStart.elements.length; i++) {
            clone.elements[i] = 0;
        }
    }

    for (let i = load.toggles.normal.length; i < playerStart.toggles.normal.length; i++) {
        load.toggles.normal[i] = playerStart.toggles.normal[i];
    }
    for (let i = load.toggles.confirm.length; i < playerStart.toggles.confirm.length; i++) {
        load.toggles.confirm[i] = 'Safe';
    }
    for (let i = load.toggles.hover.length; i < playerStart.toggles.hover.length; i++) {
        load.toggles.hover[i] = false;
    }
    for (let i = load.toggles.max.length; i < playerStart.toggles.max.length; i++) {
        load.toggles.max[i] = false;
    }
    for (let i = load.toggles.auto.length; i < playerStart.toggles.auto.length; i++) {
        load.toggles.auto[i] = false;
    }

    /* Restore data post JSON parse */
    load.fileName = new TextDecoder().decode(Uint8Array.from(load.fileName, (c) => c.codePointAt(0) as number));
    load.vaporization.clouds = new Overlimit(load.vaporization.clouds);
    load.vaporization.cloudsMax = new Overlimit(load.vaporization.cloudsMax);
    for (let s = 1; s < load.buildings.length; s++) {
        for (let i = 0; i < load.buildings[s].length; i++) {
            const building = load.buildings[s][i];
            building.current = new Overlimit(building.current);
            building.total = new Overlimit(building.total);
            building.trueTotal = new Overlimit(building.trueTotal);
        }
    }
    Object.assign(player, load);

    /* Final preparations and fixes */
    global.trueActive = player.stage.active;
    global.debug.errorID = true;
    global.debug.errorQuery = true;
    global.debug.errorGain = true;
    global.debug.historyStage = null;
    global.debug.historyVacuum = null;
    global.debug.timeLimit = false;
    const { buildings } = player;

    const progress = player.challenges.supervoid;
    global.inflationInfo.totalSuper = progress[1] + progress[2] + progress[3] + progress[4] + progress[5];
    global.collapseInfo.trueStars = buildings[4][1].true + buildings[4][2].true + buildings[4][3].true + buildings[4][4].true + buildings[4][5].true;
    global.collapseInfo.pointsLoop = 0;
    global.historyStorage.stage = player.history.stage.list;
    global.historyStorage.vacuum = player.history.vacuum.list;
    if (player.elements[26] >= 1 && player.stage.current < 5) { player.elements[26] = 0; }
    if (!player.inflation.vacuum) {
        if (buildings[2][1].current.lessOrEqual('0')) { buildings[2][0].current.max('2.7753108348135e-3'); }
        if (player.accretion.rank === 0) { buildings[3][0].current.setValue('5.9722e27'); }
        global.buildingsInfo.producing[4][5].setValue('0');
    }
    if (player.stage.true < 2) { player.toggles.hover[0] = false; }
    if (player.stage.true < 4) { player.toggles.max[0] = false; }

    for (let s = 1; s <= 5; s++) {
        for (let i = 0; i < playerStart.milestones[s].length; i++) {
            assignMilestoneInformation(i, s);
        }
    }
    for (let s = 1; s <= 6; s++) {
        if (s < 6) {
            const strangeness = player.strangeness[s];
            const strangenessMax = global.strangenessInfo[s].max;
            for (let i = 0; i < global.strangenessInfo[s].maxActive; i++) {
                calculateMaxLevel(i, s, 'strangeness');
                if (strangeness[i] > strangenessMax[i]) {
                    strangeness[i] = strangenessMax[i];
                    visualUpdateResearches(i, s, 'strangeness');
                }
            }
        }
        const extra = player.researchesExtra[s];
        const extraMax = global.researchesExtraInfo[s].max;
        for (let i = 0; i < global.researchesExtraInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researchesExtra');
            if (extra[i] > extraMax[i]) {
                extra[i] = extraMax[i];
            }
        }
        const researches = player.researches[s];
        const researchesMax = global.researchesInfo[s].max;
        for (let i = 0; i < global.researchesInfo[s].maxActive; i++) {
            calculateMaxLevel(i, s, 'researches');
            if (researches[i] > researchesMax[i]) {
                researches[i] = researchesMax[i];
            }
        }
        calculateMaxLevel(0, s, 'ASR');
        autoUpgradesSet(s);
        autoResearchesSet('researches', s);
        autoResearchesSet('researchesExtra', s);

        getId(`stageSwitch${s}`).style.textDecoration = global.trueActive === s ? 'underline' : '';
        global.lastUpgrade[s][0] = null;
    }
    for (let i = 0; i < playerStart.researchesAuto.length; i++) { calculateMaxLevel(i, 0, 'researchesAuto'); }
    for (let i = 0; i < playerStart.inflation.tree.length; i++) { calculateMaxLevel(i, 0, 'inflations'); }
    autoElementsSet();

    toggleSupervoid();
    global.lastElement = null;
    global.lastStrangeness = [null, 0];
    global.lastMilestone = [null, 0];
    global.lastChallenge[0] = player.challenges.active === null ? 1 : player.challenges.active;
    global.lastInflation = null;

    assignBuildingsProduction.strange1();
    assignBuildingsProduction.strange0();
    assignBuildingsProduction.S2Levels(true);
    assignBuildingsProduction.S4Levels(true);
    assignResetInformation.maxRank();
    assignResetInformation.trueEnergy();

    switchTab(global.tab); //Update subtab list
    visualTrueStageUnlocks();
    for (let i = 0; i < playerStart.elements.length; i++) { visualUpdateUpgrades(i, 4, 'elements'); }
    (getId('saveFileNameInput') as HTMLInputElement).value = player.fileName;
    (getId('stageInput') as HTMLInputElement).value = format(player.stage.input[0], { type: 'input' });
    (getId('stageInputTime') as HTMLInputElement).value = format(player.stage.input[1], { type: 'input' });
    (getId('vaporizationInput') as HTMLInputElement).value = format(player.vaporization.input[0], { type: 'input' });
    (getId('vaporizationInputMax') as HTMLInputElement).value = format(player.vaporization.input[1], { type: 'input' });
    (getId('collapseInput') as HTMLInputElement).value = format(player.collapse.input[0], { type: 'input' });
    (getId('collapseInputWait') as HTMLInputElement).value = format(player.collapse.input[1], { type: 'input' });
    (getId('mergeInput') as HTMLInputElement).value = format(player.merge.input, { type: 'input' });
    (getId('stageHistorySave') as HTMLInputElement).value = `${player.history.stage.input[0]}`;
    (getId('stageHistoryShow') as HTMLInputElement).value = `${player.history.stage.input[1]}`;
    (getId('vacuumHistorySave') as HTMLInputElement).value = `${player.history.vacuum.input[0]}`;
    (getId('vacuumHistoryShow') as HTMLInputElement).value = `${player.history.vacuum.input[1]}`;
    for (let i = 0; i < playerStart.toggles.normal.length; i++) { toggleSwap(i, 'normal'); }
    for (let i = 0; i < playerStart.toggles.confirm.length; i++) { toggleConfirm(i); }
    for (let i = 0; i < playerStart.toggles.hover.length; i++) { toggleSwap(i, 'hover'); }
    for (let i = 0; i < playerStart.toggles.max.length; i++) { toggleSwap(i, 'max'); }
    for (let i = 0; i < playerStart.toggles.auto.length; i++) { toggleSwap(i, 'auto'); }
    (getId('buyAnyInput') as HTMLInputElement).value = format(player.toggles.shop.input, { type: 'input' });
    updateCollapsePointsText();

    return oldVersion;
};
