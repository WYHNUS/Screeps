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

	    console.log('\n name     role    resIndex    TTL');
	    for (var name in Game.creeps) {
	        var creep = Game.creeps[name];
	        console.log(name + '  ' + creep.memory.role + '     ' + creep.memory.resIndex + '       ' + creep.ticksToLive);
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

	// ask creep to harvest resource
	instructHarvest: function(creep) {
		var sources = creep.room.find(FIND_SOURCES);
        // choosee resource to harvest based on resIndex
        if (creep.memory.resIndex === 1 && sources.length >= 1) {
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1]);
            }
        } else if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
	}
}