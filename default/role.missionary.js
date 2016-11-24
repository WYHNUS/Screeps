var USER_NAME = 'WYH';

module.exports = {
	pilgrimage: function(missionary) {
		var isMarching = false;
		// to be done --> march to mecca if not already there
		if (missionary.room.name !== missionary.memory.mecca) {
			// Allahu akbar!
			isMarching = true;
			missionary.moveTo(new RoomPosition(25, 25, missionary.memory.mecca));
		}
		
		return isMarching;
	},

	convert: function(missionary) {
		var isConverting = false;

		var controller = missionary.room.controller;
		if (controller && controller.owner.username != USER_NAME) {
	    	isConverting = true;
			missionary.say('convert!');

			var result = missionary.claimController(controller);
		    if (result === ERR_NOT_IN_RANGE) {
				missionary.say('march!');
		        missionary.moveTo(controller);
		    } else if (result === ERR_INVALID_TARGET) {
		    	missionary.say('attack!');
		    	if (missionary.attackController(controller) === ERR_NO_BODYPART) {
		    		// not enough body part...
		    		missionary.say('too weak!');
		    	}
		    } else if (result === ERR_GCL_NOT_ENOUGH) {
		    	// reserve
		    	missionary.say('reserve!');
		    	missionary.reserveController(controller);
		    }
		}

		return isConverting;
	},

	run: function(missionary) {
		if (!this.pilgrimage(missionary)) {
			// arrived at destination! Let the party begin :D
			if (!this.convert(missionary)) {
				missionary.say('Allahu AKB!');
			}
		}
	}
}