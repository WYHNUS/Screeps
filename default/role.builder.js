var util = require('utility');

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

        if (util.marchIfNotInRoom(creep) || util.rechargeTowerIfNearby(creep) 
            || util.pickupNearbyResource(creep)) {

        } else if (creep.memory.building) {
            // find construction sites which need to be built
            var construction_targets = creep.room.find(FIND_CONSTRUCTION_SITES);

            // find building which needs to be repaired immediately
            var immediate_repair_targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return Math.min(
                            structure.hits < structure.hitsMax / 2,
                            structure.hits < 2000
                        );
                    }
            });

            // check if any target needs to be constructed, sort by nearest distance first
	    	if (construction_targets.length) {
                construction_targets.sort((a, b) => {
                    return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
                });
                if (creep.build(construction_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.say('Construct!');
                    creep.moveTo(construction_targets[0]);
                }

            } else if (immediate_repair_targets.length) {
                // check if any target needs to be repaired immediately
                // sort by cloest distance
                immediate_repair_targets.sort((a, b) => {
                    return (util.calcDistance(a.pos, creep.pos) - util.calcDistance(b.pos, creep.pos));
                });
                if (creep.repair(immediate_repair_targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.say('IM repair!');
                    creep.moveTo(immediate_repair_targets[0]);
                }

            } else {
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
                        // then repair any building
                        var ans = creep.repair(in_range_targets[0]);
                        if (ans) {
                            console.log('repair nearest building error ' + ans);
                        } else {
                            creep.say('repair IR!');
                        }
                        // move away from source to prevent blocking 
                        util.moveAwayFromSource(creep);
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
            if (!util.isHarvestEfficient(creep)) {
                // not efficient --> ask to help harvest more
                util.instructHarvest(creep);
            } else if (!util.withdrawFromNearbyContainer(creep)) {
                util.instructHarvest(creep);
            }
	    }

	}
};