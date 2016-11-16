module.exports = {
	attack: function(tower) {
		var hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostile) {
            tower.attack(hostile);
        }
	}
}