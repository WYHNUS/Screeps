var util = require('utility');

function transferNearbyStructure(creep, structure) {
    var status = true;
    var inRangeStructure = creep.pos.findInRange(structure, 3);
    if (inRangeStructure.length) {
        // don't harvest, transfer
        status = false;

        // sort by cloest distance
        inRangeStructure.sort((a, b) => {
            return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
        });
        // fill target
        if (creep.transfer(inRangeStructure[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(inRangeStructure[0]);
        }
    }
    return status;
}

function transferNearestStructure(creep, structure) {
    // sort by cloest distance
    structure.sort((a, b) => {
        return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
    });
    if (creep.transfer(structure[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structure[0]);
    }
}


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

            if (creep.carry.energy > 0) {
                // fill nearby energy structure if non-empty carry
                if (targets.length) {
                    needHarvest = transferNearbyStructure(creep, targets);
                } else if (containers.length) {
                    // all structure are filled -> move on to fill nearby containers
                    needHarvest = transferNearbyStructure(creep, containers);
                }
            }

            if (needHarvest) {
                util.instructHarvest(creep);
            }

        } else if (targets.length) { 
            // re-energise the structure before container!
            transferNearestStructure(creep, targets);
        } else if (containers.length) {
            transferNearestStructure(creep, containers);

        } else {
            // nothing to do -> move away to prevent blocking
            util.moveAwayFromSource(creep);
        }
    }
};