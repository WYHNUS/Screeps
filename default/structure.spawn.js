// constants
let CREEP_LIMITS = {
    harvester: {
        resIndex1: 2,
        resIndex2: 2
    },
    upgrader: {
        resIndex1: 1,
        resIndex2: 1
    },
    builder: {
        resIndex1: 1,
        resIndex2: 1
    },
    expeditor: [
        { mecca: 'W63N42', number: 0 }
    ]
};
let CREEP_COST = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50,
    ATTACK: 80,
    RANGED_ATTACK: 150,
    HEAL: 250,
    CLAIM: 600,
    TOUGH: 10
};
let CREEP_DETAILS = {
    harvester: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    upgrader: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    builder: {
        enhanced: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE],
        basic: [WORK, CARRY, MOVE]
    },
    expeditor: {
        basic: [WORK, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE]
    },
    crusader: {
        basic: [ATTACK, MOVE, ATTACK, MOVE]
    },
    missionary: {
        basic: [CLAIM, MOVE]
    }
};
let HARVESTER_BASIC_THREADSHOLD = 2;

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
    // spawn crusader manually (need to disable spawn once generated)
    spawnCrusader: function(roomName, spawnName, mecca) {
        var crusaderCost = calculateCost(CREEP_DETAILS.crusader.basic);

        if (Game.rooms[roomName].energyAvailable >= crusaderCost) {
            var result = Game.spawns[spawnName].createCreep(
                CREEP_DETAILS.crusader.basic, undefined, { role: 'crusader', mecca: mecca }
            ); 
            if (_.isString(result)) {
                createCreepLog(result, 'crusader');
                return true;
            } else {
                // handle error
                createCreepLog(result, 'crusader');
                return false;
            }
        } else {
            return false;
        }
    },

    spawnMissionary: function(roomName, spawnName, mecca) {
        var missionaryCost = calculateCost(CREEP_DETAILS.missionary.basic);

        if (Game.rooms[roomName].energyAvailable >= missionaryCost) {
            var result = Game.spawns[spawnName].createCreep(
                CREEP_DETAILS.missionary.basic, undefined, { role: 'missionary', mecca: mecca }
            ); 
            if (_.isString(result)) {
                createCreepLog(result, 'missionary');
                return true;
            } else {
                // handle error
                createCreepLog(result, 'missionary');
                return false;
            }
        } else {
            return false;
        }
    },

    // and spawn creep with given role 
    spawn: function(roomName, spawnName) {
        // get number of creeps statistic
        var count = {};
        for (var role in CREEP_LIMITS) {
            if (CREEP_LIMITS[role].resIndex1 !== undefined) {
                count[role] = {
                    0: 0, 1: 0
                };   
            } else if (role === 'expeditor') {
                count[role] = {};
                for (var i in CREEP_LIMITS[role]) {
                    var mecca = CREEP_LIMITS[role][i]['mecca'];
                    count[role][mecca] = 0;
                }
            }
        }
        for (var name in Game.creeps) {
            var mem = Game.creeps[name].memory;
            if (count[mem.role] !==  undefined) {
                if (mem.resIndex !==  undefined) {
                    count[mem.role][mem.resIndex]++;
                } else if (mem.role === 'expeditor') {
                    count[mem.role][mem.mecca]++;
                }
            } else {
                // console.log('unknown creep role: ' + mem.role + ' with name: ' + name);
            }
        }

        for (var role in count) {
            // add creeps if not enough
            var isSpawning = false;

            var shouldAllocate = false;
            var assignIndex = -1;
            var mecca = undefined;

            if (CREEP_LIMITS[role].resIndex1 !== undefined) {
                shouldAllocate = count[role][0] + count[role][1] < CREEP_LIMITS[role].resIndex1 + CREEP_LIMITS[role].resIndex2;
                // assign harvest resource index
                assignIndex = (count[role][0] < CREEP_LIMITS[role].resIndex1 ? 0 : 1);

            } else if (role === 'expeditor') {
                for (var i in CREEP_LIMITS[role]) {
                    var expeditorArea = CREEP_LIMITS[role][i];
                    if (count[role][expeditorArea['mecca']] < expeditorArea['number']) {
                        shouldAllocate = true;
                        mecca = expeditorArea['mecca'];
                    }
                }
            }

            if (shouldAllocate) {
                var currentEnergy = Game.rooms[roomName].energyAvailable;

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

                    case 'expeditor':
                        if (currentEnergy >= calculateCost(CREEP_DETAILS[role].basic)) {
                            var result = Game.spawns[spawnName].createCreep(
                                CREEP_DETAILS[role].basic, undefined, { role: role, home: roomName, mecca: mecca }
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

                    // don't spawn
                    case 'crusader':
                        break;
                    default:
                        console.log('unhanddled role: ' + role + ' in creating role.');
                }
            }

            if (isSpawning) {
                break;
            }
        }
    }
};