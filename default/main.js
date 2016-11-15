// controllers
var harvesterCtr = require('role.harvester');
var upgraderCtr = require('role.upgrader');

// constant
let SPAWM = 'Spawn1';
let NUM = {
    MAX_CREEPS: 5,
    harvester: 2,
    upgrader: 3
};

module.exports.loop = function() {
    // get number of creeps statistic
    var count = {};
    for (var name in Game.creeps) {
        var role = Game.creeps[name].memory.role;
        if (count[role]) {
            count[role]++;
        } else {
            count[role] = 1;
        }
    }

    for (var role in count) {
        // add creeps if not enough
        if (count[role] < NUM[role]) {
            Game.spawns[SPAWM].createCreep([WORK, CARRY, MOVE], undefined, { role: role });
            break;
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
                default:
                    console.log('unhanddled role: ' + creep.memory.role);
            }
        }
    }
}