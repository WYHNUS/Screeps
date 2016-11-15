// controllers
var harvesterCtr = require('role.harvester');
var upgraderCtr = require('role.upgrader');
var builderCtr = require('role.builder');

// constant
let SPAWM = 'Spawn1';
let NUM = {
    harvester: 1,
    upgrader: 4,
    builder: 1
};
let CREEP_COST = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50
}

module.exports.loop = function() {
    // get number of creeps statistic
    var count = {};
    for (var role in NUM) {
        count.role = 0;
    }
    for (var name in Game.creeps) {
        var role = Game.creeps[name].memory.role;
        if (!!count.role) {
            count.role++;
        } else {
            count.role = 1;
        }
    }

    // check if is currently Spawning
    if (Game.spawns[SPAWM].spawning === null) {
        for (var role in count) {
            // add creeps if not enough
            if (count.role < NUM.role) {
                console.log(role + ' : ' + count.role + ' ' + NUM.role);
                // check if spawn has enough energy to create super-creep
                /*      
                    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                    hard-code super-creep attributes for now:
                        2*MOVE + WORK + 2*CARRY
                    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                */
                var superCreepCost = 2*CREEP_COST.MOVE + CREEP_COST.WORK + 2*CREEP_COST.CARRY;
                // build super creep for harvester and upgrader
                if (role != 'builder' && Game.spawns[SPAWM].energy >= superCreepCost) {
                    Game.spawns[SPAWM].createCreep([WORK, CARRY, CARRY, MOVE, MOVE], undefined, { role: role });
                    console.log('spawning creep with role: ' + role);
                    break;
                } else if ((role === 'harvester' && count.role === 0) || (role === 'builder')) {
                    // two conditions:
                    // 1. no harvester present -> HAVE to get more harvester
                    // 2. need builder
                    // Game.spawns[SPAWM].createCreep([WORK, CARRY, MOVE], undefined, { role: role });  
                    console.log('spawning creep with role: ' + role);
                    break;
                }
            }
        }
    }

    // select all creeps
    for (var name in Memory.creeps) {
        var creep = Game.creeps[name];
        
        // check if creep exist
        if (!creep) {
            // remove creep from memory
            delete Memory.creeps[name];
            console.log('creep ' + name + ' died. :(');
        } else {
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
                default:
                    console.log('unhanddled role: ' + creep.memory.role);
            }
        }
    }
}