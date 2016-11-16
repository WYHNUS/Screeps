module.exports = {
	getAllCreepsInfo: function() {
		var count = {};
        for (var name in Game.creeps) {
            var role = Game.creeps[name].memory.role;
            if (count[role] !==  undefined) {
                count[role]++;
            } else {
            	count[role] = 1;
            }
        }

	    console.log('\n name     role      TTL');
	    for (var name in Game.creeps) {
	        var creep = Game.creeps[name];
	        console.log(name + '  ' + creep.memory.role + '  ' + creep.ticksToLive);
	    }

	    console.log('\n role statistic');
	    for (var role in count) {
	    	console.log('number of ' + role + ' is ' + count[role]);
	    }
	},

	// euclidean distance btw pos a and b
	calcDistance: function(a, b) {
	    return Math.sqrt(
	        Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)
	    );
	}
}