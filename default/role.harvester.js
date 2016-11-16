var util = require('utility');

let GATHER_WHEN_IDLE_FLAG = 'Harvester_Gather_Flag_1';

module.exports = {
    run: function(creep) {

        var sources = creep.room.find(FIND_SOURCES);
        // get all buildings which can be re-energised
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION || 
                            structure.structureType === STRUCTURE_SPAWN) 
                        && (structure.energyCapacity > structure.energy);
                }
        });
        // check if containers are filled
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER)
                    && (structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
            }
        });

        // check if need there is a need to gather more energy
        if (targets.length > 0 || containers.length > 0) {

            // if less than 1/2 of the total energy -> go back and gather more sources!
            if (creep.carry.energy < creep.carryCapacity / 2) {
                // if multiple exists, harvest second one
                if (sources.length >= 1) {
                    if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[1]);
                    }
                } else if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            } else if (targets.length > 0) {
                // sort by cloest distance
                targets.sort((a, b) => {
                    return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
                });
                // re-energise the building before container!
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else if (containers.length > 0) {
                if (creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0]);
                }
            } 

        } else {
                // check if creep is within 3 tiles of any of the sources
                for (var i in sources) {
                    if (creep.pos.inRangeTo(sources[i]), 3) {
                        // instruct creep to move away towards gather point
                        var result = creep.moveTo(Game.flags[GATHER_WHEN_IDLE_FLAG]);   // 0 if okay
                        if (result) {
                            console.log('error: ' + result + ' when moving to: ' + GATHER_WHEN_IDLE_FLAG);
                        }
                    }
                }
        }
    }
};