module.exports = {
	pilgrimage: function(crusader) {
		var isMarching = false;
		// to be done --> march to mecca if not already there
		console.log(crusader.memory.mecca);
		
		return isMarching;
	},

	attack: function(crusader) {
		var isAttacking = false;

		// since creep with attack part will counter back 
		// 		--> attack tower first, then spawn, creep with no attack part last
		var hostileTower = crusader.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
			filter: function(structure) {
		        return structure.structureType === STRUCTURE_TOWER;
		    }
		});
    	var hostileSpawn = crusader.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);

        if (hostileTower) {
        	crusader.say('Allahu akbar!');
            if (crusader.attack(hostileTower) === ERR_NOT_IN_RANGE) {
            	isAttacking = true;
		        crusader.moveTo(hostileTower);
		    }
        } else if (hostileSpawn) {
        	crusader.say('GLHF :D');
            if (crusader.attack(hostileSpawn) === ERR_NOT_IN_RANGE) {
            	isAttacking = true;
		        crusader.moveTo(hostileSpawn);
		    }
		} else {
			// look for creep without attack part
			var hostileCitizen = crusader.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
				filter: function(creep) {
					return creep.getActiveBodyparts(ATTACK) === 0;
				}
			});
	        if (hostileCitizen) {
	        	crusader.say('Allahu akbar!');
	        	if (crusader.attack(hostileCitizen) === ERR_NOT_IN_RANGE) {
	            	isAttacking = true;
			        crusader.moveTo(hostileCitizen);
			    }
	        }
		}

		return isAttacking;
	},

	run: function(crusader) {
		if (!this.pilgrimage(crusader)) {
			// arrived at destination! Let the party begin :D
			if (!this.attack(crusader)) {
				crusader('Peace. :)');
			}
		}
	}
}