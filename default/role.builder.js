var util = require('utility');

let CONTAINER_EXTRACT_THREADSHOLD = 300;

module.exports = {
    run: function(creep) {

        // go gather energy if not enough
	    if (creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if (creep.memory.building) {
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

	    	// check if any target needs to be repaired immediately
	    	if (immediate_repair_targets.length) {
                // sort by cloest distance
                immediate_repair_targets.sort((a, b) => {
                    return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
                });

                if (creep.repair(immediate_repair_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.say('IM repair!');
                    creep.moveTo(immediate_repair_targets[0]);
                }

            } else if (construction_targets.length) {
	    		// check if any target needs to be constructed
                if (creep.build(construction_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.say('Construct!');
                    creep.moveTo(construction_targets[0]);
                }

            } else  {
                var all_repair_targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.hits < 0.9 * structure.hitsMax);
                        }
                });

                if (all_repair_targets.length) {
                    // repair anything in range, sort by lowest hp first
                    var in_range_targets = creep.pos.findInRange(all_repair_targets, 3);
                    in_range_targets.sort((a, b) => {
                        return (a.hits - b.hits);
                    });

                    if (in_range_targets.length) {
                        var ans = creep.repair(in_range_targets[0]);
                        if (ans) {
                            console.log('repair nearest building error ' + ans);
                        } else {
                            creep.say('repair IR!');
                        }
                    } else {
                        // sort by cloest distance
                        all_repair_targets.sort((a, b) => {
                            return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
                        });
                        
                        if (creep.repair(all_repair_targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.say('repair');
                            creep.moveTo(all_repair_targets[0]);
                        }
                    }
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
                if (creep.pos.inRangeTo(containers[i], 3)) {
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