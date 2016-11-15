// controllers
var harvesterCtr = require('role.harvester');
var upgraderCtr = require('role.upgrader');
var builderCtr = require('role.builder');

// constant
let SPAWM = 'Spawn1';
let NUM = {
    harvester: 4,
    upgrader: 5,
    builder: 5
};
let CREEP_COST = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50
}

function createCreepLog(result, role) {
    if (_.isString(result)) {
        console.log('spawning creep ' + result + ' with role: ' + role);
    } else {
        console.log('Spawn error: ' + result + ' with role: ' + role);
    }
}

module.exports.loop = function() {
    // get number of creeps statistic
    var count = {};
    for (var role in NUM) {
        count[role] = 0;
    }
    for (var name in Game.creeps) {
        var role = Game.creeps[name].memory.role;
        if (count[role] !==  undefined) {
            count[role]++;
        }
    }

    // check if is currently Spawning
    if (Game.spawns[SPAWM].spawning === null) {
        for (var role in count) {
            // add creeps if not enough
            if (count[role] < NUM[role]) {
                // check if spawn has enough energy to create super-creep
                /*      
                    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                    hard-code super-creep attributes for now
                    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                */
                switch (role) {
                    case 'harvester':
                        var superCreepCost = CREEP_COST.WORK + 2*CREEP_COST.CARRY + CREEP_COST.MOVE;
                        var creepCost = CREEP_COST.WORK + CREEP_COST.CARRY + CREEP_COST.MOVE;
                        
                        if (Game.spawns[SPAWM].energy >= superCreepCost) {
                            var result = Game.spawns[SPAWM].createCreep(
                                [WORK, CARRY, CARRY, MOVE, MOVE], 
                                undefined, 
                                { role: role }
                            );
                            createCreepLog(result, role);
                        } else if (Game.spawns[SPAWM].energy >= creepCost) {
                            var result = Game.spawns[SPAWM].createCreep([WORK, CARRY, MOVE], undefined, { role: role });  
                            createCreepLog(result, role);
                        }
                        break;
                    case 'upgrader':
                        var superCreepCost = 2*CREEP_COST.WORK + CREEP_COST.CARRY + 2*CREEP_COST.MOVE;
                        if (Game.spawns[SPAWM].energy >= superCreepCost) {
                            var result = Game.spawns[SPAWM].createCreep(
                                [WORK, WORK, CARRY, MOVE, MOVE], 
                                undefined, 
                                { role: role }
                            );
                            createCreepLog(result, role);
                        }
                        break;
                    case 'builder':
                        var superCreepCost = 2*CREEP_COST.WORK + CREEP_COST.CARRY + 2*CREEP_COST.MOVE;
                        if (Game.spawns[SPAWM].energy >= superCreepCost) {
                            var result = Game.spawns[SPAWM].createCreep(
                                [WORK, WORK, CARRY, MOVE, MOVE], 
                                undefined, 
                                { role: role }
                            );
                            createCreepLog(result, role);
                        }
                        break;
                    default:
                        console.log('unhanddled role: ' + creep.memory.role + ' in creating role.');
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
                    console.log('unhanddled role: ' + creep.memory.role + ' in handler.');
            }
        }
    }
}