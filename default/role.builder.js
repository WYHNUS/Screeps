let CONTAINER_EXTRACT_THREADSHOLD = 300;

module.exports = {
    run: function(creep) {

	    if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    // find construction sites which need to be built
	    var construction_targets = creep.room.find(FIND_CONSTRUCTION_SITES);

	    // find building which needs to be repaired immediately
	    // repair condition --> 
        //      wall / rampart / container: less than 2k of the maxHits
        //      otherwise: less than 1/2 of the maxHits
	    var immediate_repair_targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType !== STRUCTURE_WALL && 
                            structure.structureType !== STRUCTURE_RAMPART &&
                            structure.structureType !== STRUCTURE_CONTAINER) && 
                            structure.hits < structure.hitsMax / 2) 
                            ||
                           ((structure.structureType === STRUCTURE_WALL || 
                            structure.structureType === STRUCTURE_RAMPART ||
                            structure.structureType === STRUCTURE_CONTAINER) && 
                            structure.hits < 2000);
                }
        });
        var all_repair_targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < structure.hitsMax);
                }
        });

	    if (creep.memory.building) {
	    	// check if any target needs to be repaired
	    	if (immediate_repair_targets.length) {
                // immediate_repair_targets.sort((a, b) => a.hits - b.hits);
                if (creep.repair(immediate_repair_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(immediate_repair_targets[0]);
                }
            } else if (construction_targets.length) {
	    		// check if any target needs to be constructed
                if (creep.build(construction_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(construction_targets[0]);
                }
            } else if (all_repair_targets.length) {
                // all_repair_targets.sort((a, b) => a.hits - b.hits);
                if (creep.repair(all_repair_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(all_repair_targets[0]);
                }
            }
	    } else {
            // check if any container with enough energy nearby
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_CONTAINER)
                        && (structure.store[RESOURCE_ENERGY] >= CONTAINER_EXTRACT_THREADSHOLD);
                }
            });
            var isWithdrawing = false;

            for (var i in containers) {
                if (creep.pos.inRangeTo(containers[i]), 4) {
                    // instruct creep to mine from that container
                    if (creep.withdraw(containers[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(containers[i]);
                    }
                    isWithdrawing = true;
                    break;
                }
            }

            if (!isWithdrawing) {
                // move to first found source
                var sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
	    }

	}
};