// creep controllers
var harvesterCtr = require('role.harvester');
var upgraderCtr = require('role.upgrader');
var builderCtr = require('role.builder');

// structure controller
var spawnCtr = require('structure.spawn');
var towerCtr = require('structure.tower');

var util = require('utility');

// constant
let SPAWM = 'Spawn1';
let ROOM = 'W63N43';

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
                default:
                    console.log('unhanddled role: ' + creep.memory.role + ' in handler.');
            }
        }
    }
    // util.getAllCreepsInfo();

    // check if is currently spawning
    if (Game.spawns[SPAWM].spawning === null) {
        // if not spawning, spawn if needed
        spawnCtr.spawn(ROOM, SPAWM);
    }

    // tower logic
    var towers = Game.rooms[ROOM].find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_TOWER
                && structure.energy > 0);
        }
    });
    for (var id in towers) {
        towerCtr.attack(towers[id]);
    }
}