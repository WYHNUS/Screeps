var util = require('utility');

module.exports = {
    run: function(creep) {
        if (util.marchIfNotInRoom(creep) || util.pickupNearbyResource(creep)) {

        } else {
            if (creep.memory.upgrading && creep.carry.energy == 0) {
                creep.memory.upgrading = false;
                creep.say('harvesting');
            }
            if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
                creep.memory.upgrading = true;
                creep.say('upgrading');
            }

            if (creep.memory.upgrading) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
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
    }
};