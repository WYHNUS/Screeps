var util = require('utility');

let GATHER_WHEN_IDLE_FLAG = 'Harvester_Gather_Flag_1';

module.exports = {
    run: function(creep) {

        // get all structure need to be energised
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION || 
                            structure.structureType === STRUCTURE_SPAWN) 
                        && (structure.energyCapacity > structure.energy);
                }
        });
        // get containers can be filled
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER)
                    && (structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
            }
        });


        // check if need there is a need to gather more energy
        if (creep.carry.energy < creep.carryCapacity) {
            var needHarvest = true;

            // fill nearby energy structure if non-empty carry
            if (targets.length && creep.carry.energy > 0) {
                var in_range_targets = creep.pos.findInRange(targets, 3);
                if (in_range_targets.length) {
                    // don't harvest, transfer
                    needHarvest = false;

                    // sort by cloest distance
                    in_range_targets.sort((a, b) => {
                        return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
                    });
                    // fill target
                    if (creep.transfer(in_range_targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(in_range_targets[0]);
                    }
                }
            }

            if (needHarvest) {
                util.instructHarvest(creep);
            }

        } else if (targets.length) {
            // sort by cloest distance
            targets.sort((a, b) => {
                return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
            });
            // re-energise the structure before container!
            if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else if (containers.length) {
            if (creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(containers[0]);
            }
        } else {
            // nothing to do -> check if creep is within 3 tiles of any of the sources
            var sources = creep.room.find(FIND_SOURCES);
            for (var i in sources) {
                if (creep.pos.inRangeTo(sources[i]), 3) {
                    // instruct creep to move away towards gather point to prevent blocking source
                    var result = creep.moveTo(Game.flags[GATHER_WHEN_IDLE_FLAG]);   // 0 if okay
                    if (result) {
                        console.log('error: ' + result + ' when moving to: ' + GATHER_WHEN_IDLE_FLAG);
                    }
                }
            }
        }
    }
};