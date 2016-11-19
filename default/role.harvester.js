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
        if (creep.transfer(inRangeStructure[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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
    if (creep.transfer(structure[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(structure[0]);
    }
}


module.exports = {
    embark: function(creep) {
        if (!util.pickupNearbyResource(creep)) {
            if (creep.room.name === creep.memory.home) {
                // check if carrying resource now
                if (creep.carry.energy > 0) {
                    // put back to storage
                    var storage = creep.room.storage;
                    if (storage) {
                        if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.say('Free RES!');
                            creep.moveTo(storage);
                        }
                    } else {
                        creep.say('Storage?');
                    }
                } else {
                    // Allahu akbar!
                    creep.say('March!');
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.mecca));
                }
            } else if (creep.room.name === creep.memory.mecca) {
                if (creep.carry.energy < creep.carryCapacity) {
                    var source = creep.pos.findClosestByRange(FIND_SOURCES);
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        creep.say('Take!');
                        creep.moveTo(source);
                    }
                } else {
                    // back back!!!
                    creep.say('Back!');
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
                }
            } else {
                if (creep.carry.energy > creep.carryCapacity / 2) {
                    // back back!!!
                    creep.say('Back!');
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.home));
                } else {
                    // Allahu akbar!
                    creep.say('March!');
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.mecca));
                }
            }
        }
    },

    run: function(creep) {
        if (!util.pickupNearbyResource(creep)) {
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
                        && (structure.store[RESOURCE_ENERGY] < structure.storeCapacity)
                        || (structure.structureType === STRUCTURE_STORAGE);
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
    }
};