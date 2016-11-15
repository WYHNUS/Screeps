var roleHarvester = require('role.harvester');

module.exports.loop = function () {
    for(var creep of Game.creeps) {
        roleHarvester.run(creep);
    }
}