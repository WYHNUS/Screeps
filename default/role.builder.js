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

	    // find building which needs to be repaired
	    // repair condition --> less than 1/2 of the maxHits
	    var repair_targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType !== STRUCTURE_EXTENSION || 
                            structure.structureType !== STRUCTURE_SPAWN || 
                            structure.structureType !== STRUCTURE_CONTAINER) 
                        && (structure.hits < structure.hitsMax / 2);
                }
        });

	    if (creep.memory.building) {
	    	// check if any target needs to be repaired
	    	if (repair_targets.length) {
                if (creep.repair(repair_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repair_targets[0]);
                }
            } else if (construction_targets.length) {
	    		// check if any target needs to be constructed
                if (creep.build(construction_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(construction_targets[0]);
                }
            }
	    } else {
	    	// move to first found source
	        var sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
	    }

	}
};