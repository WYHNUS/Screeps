let GATHER_WHEN_IDLE_FLAG = 'Harvester_Gather_Flag_1';
let CONTAINER_EXTRACT_THRESHOLD = 300;
let MIN_CD_TO_TRAVEL = 30;
let ENERGY_PICKUP_THRESHOLD = 10;
let ENERGY_PICKUP_RANGE = 5;

module.exports = {
	getAllCreepsInfo: function() {
		var count = {};
        for (var name in Game.creeps) {
            var role = Game.creeps[name].memory.role;
            var resIndex = Game.creeps[name].memory.resIndex;
            if (count[role] ===  undefined) {
                count[role] = {
                	0: 0, 1: 0
                }
            }
        	count[role][resIndex]++;
        }

	    console.log('\n name     role    resIndex    originRoom    TTL');
	    for (var name in Game.creeps) {
	        var creep = Game.creeps[name];
	        console.log(name + '  ' + creep.memory.role + '     ' 
	        	+ (creep.memory.resIndex+1) + '          ' + creep.memory.originRoom
	        	+ '       ' + creep.ticksToLive);
	    }

	    console.log('\n role statistic');
	    for (var role in count) {
	    	console.log('number of ' + role + ' in pos1: ' + count[role][0] + ' in pos2: ' + count[role][1]);
	    }
	},

	// euclidean distance btw pos a and b
	calcDistance: function(a, b) {
	    return Math.sqrt(
	        Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)
	    );
	},

	// check if current harvest speed is faster than resource regeneration speed
	isHarvestEfficient: function(creep) {
		var sources = creep.room.find(FIND_SOURCES);
		var selectedSource = sources[0];
		if (creep.memory.resIndex === 1 && sources.length >= 1) {
			selectedSource = sources[1];
		}
		// console.log(selectedSource.energy / 10 < selectedSource.ticksToRegeneration);
		return (selectedSource.energy / 10 < selectedSource.ticksToRegeneration);
	},

	// ask creep to harvest resource
	instructHarvest: function(creep) {
		var sources = creep.room.find(FIND_SOURCES);
		var chooseContainer = true;
        // choosee resource to harvest based on resIndex
        if (creep.memory.resIndex === 1 && sources.length >= 1) {
        	if (sources[1].energy > 0) {
	        	chooseContainer = false;
	            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(sources[1]);
	            }
        	} else if (sources[1].ticksToRegeneration > MIN_CD_TO_TRAVEL 
        			&& sources[0].energy > 0) {
        		chooseContainer = false;
	        	if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		            creep.moveTo(sources[0]);
		        }
        	} else if (creep.memory.role === 'harvester') {
        		// harvester wait by source
        		creep.moveTo(sources[1]);
        	}
        } else {
        	if (sources[0].energy > 0) {
	        	chooseContainer = false;
	        	if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		            creep.moveTo(sources[0]);
		        }
	        } else if (sources[0].ticksToRegeneration > MIN_CD_TO_TRAVEL
	        		&& sources[1].energy > 0 ) {
	        	chooseContainer = false;
	        	if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(sources[1]);
	            }
	        } else if (creep.memory.role === 'harvester') {
        		// harvester wait by source
        		creep.moveTo(sources[0]);
        	}
	    }

        // choose nearest container to extract resource from 
        // (not true for harvester --> buggy loophole logic otherwise for now)
        if (chooseContainer && creep.memory.role != 'harvester') {
        	creep.say('use reserve!');
        	var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_CONTAINER)
                        && (structure.store[RESOURCE_ENERGY] > 0)
                        ||	(structure.structureType === STRUCTURE_STORAGE);
                }
            });
            containers.sort((a, b) => {
                return (this.calcDistance(a.pos, creep.pos) - this.calcDistance(b.pos, creep.pos));
            });

            if (containers.length) {
	            if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
	                creep.moveTo(containers[0]);
	            }
            }
        }
	},

	withdrawFromNearbyContainer: function(creep) {
		var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER)
                    && (structure.store[RESOURCE_ENERGY] >= CONTAINER_EXTRACT_THRESHOLD);
            }
        });
        var isWithdrawing = false;

        for (var i in containers) {
            if (creep.pos.inRangeTo(containers[i], 3)) {
                // instruct creep to mine from that container
                if (creep.withdraw(containers[i], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                	creep.say('container!');
                    creep.moveTo(containers[i]);
                }
                isWithdrawing = true;
                break;
            }
        }
        return isWithdrawing;
	},

	rechargeTowerIfNearby: function(creep) {
		var isTransferring = false;
		if (creep.carry.energy > 0) {
			var towers = creep.room.find(FIND_STRUCTURES, {
	            filter: (structure) => {
	                return (structure.structureType === STRUCTURE_TOWER 
	                    && structure.energyCapacity > structure.energy);
	            }
	        });
	        var inRangeTowers = creep.pos.findInRange(towers, 5);

	        if (inRangeTowers.length) {
	        	creep.say('tower!');
	            // fill target
	            if (creep.transfer(inRangeTowers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
		        	isTransferring = true;
	                creep.moveTo(inRangeTowers[0]);
	            }
	        }
	    }
	    return isTransferring;
	},

	pickupNearbyResource: function(creep) {
		var isPickingUp = false;
		// check if creep can pickup
		if (creep.carry.energy <= creep.carryCapacity - ENERGY_PICKUP_THRESHOLD) {
			var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, ENERGY_PICKUP_RANGE, {
				filter: (energy) => {
                    return energy.amount > ENERGY_PICKUP_THRESHOLD;
                }
			});
			if (droppedEnergy.length > 0) {
				creep.say('no waste!');
				if(creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
					isPickingUp = true;
			        creep.moveTo(droppedEnergy[0]);
			    }
			}
		}
		return isPickingUp;
	},

	moveAwayFromSource: function(creep) {
		var isMoving = false;
		var sources = creep.room.find(FIND_SOURCES);
        for (var i in sources) {
            if (creep.pos.inRangeTo(sources[i], 1)) {
                // instruct creep to move away towards gather point to prevent blocking source
                creep.say('dont block!');
                if (!creep.moveTo(Game.flags[GATHER_WHEN_IDLE_FLAG])) {
	            	isMoving = true;
	            	break;
                }
            }
        }
        return isMoving;
	},

	marchIfNotInRoom: function(creep) {
		var shouldMarch = (creep.room.name !== creep.memory.originRoom);
        if (shouldMarch) {
        	creep.say('march!!!');
        	creep.moveTo(new RoomPosition(25, 25, creep.memory.originRoom));
        }
        return shouldMarch;
	}
}