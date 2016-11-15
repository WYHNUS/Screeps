/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep) {
        if (creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }
        if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }
        
        if (creep.memory.building) {
            var src = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (src.length) {
                if (creep.build(src[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(src[0]);   
                }
            }
        } else {
            var src = creep.room.find(FIND_SOURCES);
            if (creep.harvest(src[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(src[0]);
            }
        }
    }
};