// constants
let CREEP_LIMITS = {
    harvester: {
        resIndex1: 2,
        resIndex2: 2
    },
    upgrader: {
        resIndex1: 2,
        resIndex2: 2
    },
    builder: {
        resIndex1: 2,
        resIndex2: 2
    }
};
let CREEP_COST = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50
};
let CREEP_DETAILS = {
    harvester: {
        enhanced: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    upgrader: {
        enhanced: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    builder: {
        enhanced: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        basic: [WORK, CARRY, MOVE]
    }
};
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
            count[role] = {
                0: 0, 1: 0
            };
        }
        for (var name in Game.creeps) {
            var mem = Game.creeps[name].memory;
            if (count[mem.role] !==  undefined) {
                count[mem.role][mem.resIndex]++;
            } else {
                console.log('unknown creep role: ' + mem.role + ' with name: ' + name);
            }
        }

        for (var role in count) {
            // add creeps if not enough
            var isSpawning = false;

            if (count[role][0] + count[role][1] < CREEP_LIMITS[role].resIndex1 + CREEP_LIMITS[role].resIndex2) {
                var currentEnergy = Game.rooms[roomName].energyAvailable;
                // assign harvest resource index
                var assignIndex = (count[role][0] < CREEP_LIMITS[role].resIndex1 ? 0 : 1);

                switch (role) {
                    case 'harvester':
                        var superCreepCost = calculateCost(CREEP_DETAILS[role].enhanced);
                        
                        if (currentEnergy >= superCreepCost) {
                            var result = Game.spawns[spawnName].createCreep(
                                CREEP_DETAILS[role].enhanced, undefined, { role: role, resIndex: assignIndex }
                            );
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
                                var result = Game.spawns[spawnName].createCreep(
                                    CREEP_DETAILS[role].basic, undefined, { role: role, resIndex: assignIndex }
                                ); 
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
                            var result = Game.spawns[spawnName].createCreep(
                                CREEP_DETAILS[role].enhanced, undefined, { role: role, resIndex: assignIndex }
                            );
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