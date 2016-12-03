// creep controllers
var harvesterCtr = require('role.harvester');
var upgraderCtr = require('role.upgrader');
var builderCtr = require('role.builder');
var crusaderCtr = require('role.crusader');
var missionaryCtr = require('role.missionary');

// structure controller
var spawnCtr = require('structure.spawn');
var towerCtr = require('structure.tower');

var util = require('utility');

// constant
let SPAWN_1 = 'Spawn1';
let ROOM_1 = 'W63N43';
let CRUSADE_TARGET_ROOM = 'W63N42';
let MISSIONARY_TARGET_ROOM = 'W63N42';

let CREEP_LIMITS_1 = {
    harvester: {
        resIndex1: 2,
        resIndex2: 2
    },
    upgrader: {
        resIndex1: 1,
        resIndex2: 1
    },
    builder: {
        resIndex1: 1,
        resIndex2: 1
    },
    expeditor: [
        { mecca: 'W63N42', number: 0 }
    ]
};
let CREEP_DETAILS_1 = {
    harvester: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    upgrader: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    builder: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    expeditor: {
        basic: [WORK, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE]
    },
    crusader: {
        basic: [ATTACK, MOVE, ATTACK, MOVE]
    },
    missionary: {
        basic: [CLAIM, MOVE]
    }
};

let SPAWN_2 = 'Spawn2';
let ROOM_2 = 'W63N42';
let CREEP_LIMITS_2 = {
    harvester: {
        resIndex1: 2,
        resIndex2: 0
    },
    upgrader: {
        resIndex1: 0,
        resIndex2: 3
    },
    builder: {
        resIndex1: 2,
        resIndex2: 1
    }
};
let CREEP_DETAILS_2 = {
    harvester: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    upgrader: {
        enhanced: [WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    builder: {
        enhanced: [WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    }
};

module.exports.loop = function() {
    // select all creeps
    for (var name in Memory.creeps) {
        var creep = Game.creeps[name];
        
        // check if creep exist
        if (!creep) {
            // remove creep from memory if dead
            delete Memory.creeps[name];
            console.log('creep ' + name + ' died. :(');
        } else if (!creep.spawning) {
            // instruct to work based on role
            switch (creep.memory.role) {
                case 'harvester':
                    harvesterCtr.run(creep);
                    break;
                case 'upgrader':
                    upgraderCtr.run(creep);
                    break;
                case 'builder':
                    builderCtr.run(creep);
                    break;
                case 'crusader':
                    crusaderCtr.run(creep);
                    break;
                case 'expeditor':
                    harvesterCtr.embark(creep);
                    break;
                case 'missionary':
                    missionaryCtr.run(creep);
                    break;
                default:
                    console.log('unhanddled role: ' + creep.memory.role + ' in handler.');
            }
        }
    }
    // util.getAllCreepsInfo();

    // check if is currently spawning
    if (Game.spawns[SPAWN_1].spawning === null) {
        // only enable when wanna attack / convert XD
        // spawnCtr.spawnCrusader(ROOM_1, SPAWN_1, CRUSADE_TARGET_ROOM, CREEP_DETAILS_1.crusader.basic);
        // spawnCtr.spawnMissionary(ROOM_1, SPAWN_1, MISSIONARY_TARGET_ROOM, CREEP_DETAILS_1.missionary.basic);

        // if not spawning, spawn if needed
        spawnCtr.spawn(ROOM_1, SPAWN_1, CREEP_DETAILS_1, CREEP_LIMITS_1);
    }

    if (Game.spawns[SPAWN_2].spawning === null) {
        // if not spawning, spawn if needed
        spawnCtr.spawn(ROOM_2, SPAWN_2, CREEP_DETAILS_2, CREEP_LIMITS_2);
    }

    // hard-code spawn manually
    // var tmpCounter = { 'builder': 0, 'upgrader': 0};
    // for (var name in Memory.creeps) {
    //     var creep = Game.creeps[name];
    //     if (creep.memory.originRoom === ROOM_2) {
    //         // get statistic
    //         tmpCounter[creep.memory.role]++;
    //     }
    // }
    // if (Game.spawns[SPAWN_1].spawning === null) {
    //     if (tmpCounter.builder < 1) {
    //         Game.spawns[SPAWN_1].createCreep(
    //             CREEP_DETAILS_1.builder.enhanced, undefined, 
    //             { role: 'builder', resIndex: 0, originRoom: ROOM_2 }
    //         );
    //     } else if (tmpCounter.upgrader < 2) {
    //         Game.spawns[SPAWN_1].createCreep(
    //             CREEP_DETAILS_1.builder.enhanced, undefined, 
    //             { role: 'upgrader', resIndex: 1, originRoom: ROOM_2 }
    //         ); 
    //     } 
    // }

    // tower logic
    var towers = Game.rooms[ROOM_1].find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_TOWER
                && structure.energy > 0);
        }
    });
    for (var id in towers) {
        towerCtr.attack(towers[id]);
    }
}