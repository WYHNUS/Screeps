module.exports = {
    run: function(creep) {

        // check if several building can be re-energised
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || 
                            structure.structureType == STRUCTURE_SPAWN || 
                            structure.structureType == STRUCTURE_CONTAINER) 
                        && (structure.energyCapacity - structure.energy) > 0;
                }
        });

        // check if need there is a need to gather more energy
        if (targets.length > 0 && creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);

            // if multiple exists, harvest second one
            if (sources.length >= 1) {
                if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[1]);
                }
            } else if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }

        } else if (targets.length > 0) {

            // re-energise the building!
            if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
            
        }
    }
};