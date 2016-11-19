module.exports = {
	pilgrimage: function(crusader) {
		var isMarching = false;
		// to be done --> march to mecca if not already there
		if (crusader.room.name !== crusader.memory.mecca) {
			// Allahu akbar!
			isMarching = true;
			crusader.moveTo(new RoomPosition(25, 25, crusader.memory.mecca));
		}
		
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
        	crusader.say('Allahu AKB!');
        	isAttacking = true;
            if (crusader.attack(hostileTower) === ERR_NOT_IN_RANGE) {
		        crusader.moveTo(hostileTower);
		    }
        } else if (hostileSpawn) {
        	crusader.say('GLHF :D');
        	isAttacking = true;
            if (crusader.attack(hostileSpawn) === ERR_NOT_IN_RANGE) {
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
	        	crusader.say('Allahu AKB!');
            	isAttacking = true;
	        	if (crusader.attack(hostileCitizen) === ERR_NOT_IN_RANGE) {
			        crusader.moveTo(hostileCitizen);
			    }
	        } else {
	        	// attack other buildings
	        }
		}

		return isAttacking;
	},

	run: function(crusader) {
		if (!this.pilgrimage(crusader)) {
			// arrived at destination! Let the party begin :D
			if (!this.attack(crusader)) {
				crusader.say('Peace. :D');
			}
		}
	}
}