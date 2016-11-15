// constants
let CREEP_LIMITS = {
    harvester: 5,
    upgrader: 2,
    builder: 7
};
let CREEP_COST = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50
}
let CREEP_DETAILS = {
    harvester: {
        enhanced: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    upgrader: {
        enhanced: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    builder: {
        enhanced: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE],
        basic: [WORK, CARRY, MOVE]
    }
}
let HARVESTER_BASIC_THREADSHOLD = 3;

function createCreepLog(result, role, isBasic=false) {
    if (_.isString(result)) {
        if (isBasic) {
            console.log('spawning basic creep ' + result + ' with role ' + role);
        } else {
            console.log('spawning enhanced creep ' + result + ' with role: ' + role);
        }
    } else {
        console.log('Spawn error: ' + result + ' with role: ' + role);
    }
}

function calculateCost(arr) {
    var totCost = 0;
    for (var role in arr) {
        totCost += CREEP_COST[arr[role].toUpperCase()];
    }
    return totCost;
}

module.exports = {
    // use given roomName and spawnName to find specified spawn structure
    // and spawn creep with given role 
    spawn: function(roomName, spawnName) {
        // get number of creeps statistic
        var count = {};
        for (var role in CREEP_LIMITS) {
            count[role] = 0;
        }
        for (var name in Game.creeps) {
            var role = Game.creeps[name].memory.role;
            if (count[role] !==  undefined) {
                count[role]++;
            }
        }

        // print statistic
        // console.log('current round statistic:');
        // for (var role in count) {
        //     console.log('number of ' + role + ' is ' + count[role]);
        // }

        for (var role in count) {
            // add creeps if not enough
            var isSpawning = false;

            if (count[role] < CREEP_LIMITS[role]) {
                var currentEnergy = Game.rooms[roomName].energyAvailable;

                switch (role) {
                    case 'harvester':
                        var superCreepCost = calculateCost(CREEP_DETAILS[role].enhanced);
                        
                        if (currentEnergy >= superCreepCost) {
                            var result = Game.spawns[spawnName].createCreep(CREEP_DETAILS[role].enhanced, undefined, {role: role});
                            if (_.isString(result)) {
                                isSpawning = true;
                                createCreepLog(result, role);
                            } else {
                                // handle error
                                createCreepLog(result, role);
                            }
                        } else if (count[role] <= HARVESTER_BASIC_THREADSHOLD) {
                            // only create basic creep if too little harvester are present
                            var creepCost = calculateCost(CREEP_DETAILS[role].basic);
                            if (currentEnergy >= creepCost) {
                                var result = Game.spawns[spawnName].createCreep(CREEP_DETAILS[role].basic, undefined, {role: role}); 
                                if (_.isString(result)) {
                                    isSpawning = true;
                                    createCreepLog(result, role, true);
                                } else {
                                    // handle error
                                    createCreepLog(result, role, true);
                                }
                            }
                        }
                        break;

                    // if no basic creep needs to be created
                    case 'upgrader':
                    case 'builder':
                        var superCreepCost = calculateCost(CREEP_DETAILS[role].enhanced);
                        
                        if (currentEnergy >= superCreepCost) {
                            var result = Game.spawns[spawnName].createCreep(CREEP_DETAILS[role].enhanced, undefined, {role: role});
                            if (_.isString(result)) {
                                isSpawning = true;
                                createCreepLog(result, role);
                            } else {
                                // handle error
                                createCreepLog(result, role);
                            }
                        }
                        break;

                    default:
                        console.log('unhanddled role: ' + creep.memory.role + ' in creating role.');
                }
            }

            if (isSpawning) {
                break;
            }
        }
    }
};