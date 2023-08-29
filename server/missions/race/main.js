'use strict';

let Races = [];
const RACE_DIMENSION = 20;
const RACE_WAIT_TIME = 60;
const RACE_MIN_PARTICIPANTS = 2;
const RACE_WAIT_TIME_FOR_LATE = 30;
const RACE_WINNERS_TO_WAIT_START = 1;

let race = {
  id: -1,
  participants: [],
  grid: [],
  checkpoints: [],
  winners: [],
  dnf: [],
  timer: null,
  counter: RACE_WAIT_TIME,
  isRunning: false,
}

class Race {
  constructor(track) {
    this.track = track;
    this.id = Races.push(track);
  }

  static getType() {
    if (race.id == -1) return false;
    else return Races[race.id].laps === 1 ? 'Sprint' : 'Circuit';
  }

  static get() {
    if (race.id == -1) return false;
    else return Races[race.id];
  }

  static getRacer(client) {
    const racerId = race.participants.findIndex((element) => element.client == client);
    return race.participants[racerId];
  }

  static cleanRaceData() {
    race.checkpoints.forEach(element => {
      element.sphere.destructor();
    });

    race.id = -1;
    race.participants = [];
    race.grid = [];
    race.checkpoints = [];
    race.winners = [];
    race.dnf = [];
    race.counter = RACE_WAIT_TIME;
    race.isRunning = false;

    if (race.timer) {
      clearInterval(race.timer);
      race.timer = null;
      race.counter = RACE_WAIT_TIME;
    }
  }

  static prepare(id, client = null) {
    // Check if race isnt started
    if (race.id == -1) {
      // Set race id and do a cleanup.
      race.id = id;
      race.participants = [];
      race.grid = [];
      race.checkpoints = [];
      race.winners = [];
      race.dnf = [];

      Races[race.id].checkpoints.forEach((element, index) => {
        const cp = {
          id: index,
          sphere: new Sphere(new Vec3(element[0], element[1], element[2]), 5, Race.onCheckpointEnter, 0, 2, COLOUR_GREEN, true, true),
        }
  
        cp.sphere.instance.dimension = RACE_DIMENSION;
        
        /*if (index > 0) {
          cp.sphere.instance.netFlags.defaultExistance = false;
          cp.sphere.blip.netFlags.defaultExistance = false;
        }*/
    
        race.checkpoints.push(cp);
      });

      if (race.timer) {
        clearInterval(race.timer);
        race.timer = null;
        race.counter = RACE_WAIT_TIME;
      }

      race.timer = setInterval(Race.printInfo, 1000);
      
      Locale.sendMessage(null, false, COLOUR_WHITE, 'race.prepare', Races[race.id].name, Race.getType());
      Locale.sendMessage(null, false, COLOUR_WHITE, 'race.gridSize', Races[race.id].grid.length);
      Locale.sendMessage(null, false, COLOUR_WHITE, 'race.waiting', Races[race.id].name);

      decho(3, `Race "${Races[race.id].name}" is waiting for players!`);
    }
  }

  static printInfo() {
    race.counter--;

    if (!race.isRunning) {
      triggerNetworkEvent('smallMessage', null, `Waiting ${race.counter}s for Racers ${race.participants.length}/${Races[race.id].grid.length}`, 1000, 2);
  
      if (race.counter === 0 || race.participants.length === Races[race.id].grid.length) {
        Race.checkRacers();
      }
    } else {
      triggerNetworkEvent('smallMessage', null, `${race.counter}s to the race finish.`, 1000, 2);

      if (race.counter === 0) {
        race.participants.forEach(element => {
          Race.onRaceCorrupted(element.client);
        });
      }
    }
  }

  static checkRacers() {
    if (race.timer) {
      clearInterval(race.timer);
      race.timer = null;
      race.counter = RACE_WAIT_TIME;
    }

    if (race.participants.length >= RACE_MIN_PARTICIPANTS) {
      Race.countdown();
    } else {
      race.participants.forEach(element => {
        Race.onRaceCorrupted(element.client);
      });

      Locale.sendMessage(null, false, COLOUR_WHITE, 'race.notEnoughParticipants');

      Race.cleanRaceData();
    }
  }

  static countdown() {
    race.participants.forEach(element => {
      countdown(element.client, true, true)
    });
  }

  static start(client) {
    race.isRunning = true;
    Locale.sendMessage(client, false, COLOUR_WHITE, 'race.start', race.participants.length);

    Race.getRacer(client).time.push(sdl.ticks);
    Race.getRacer(client).lap++;
  }

  static join(client) {
    if (client.getData('isRacer') === true || race.isRunning) return;

    if (race.id != -1) {
      if (Races[race.id] && Races[race.id].grid.length > race.participants.length) {
        if (client.player.vehicle && client.player.vehicle.modelIndex == Races[race.id].vehicle) {
          const racer = {
            client: client,
            time: [], // 0 is start time
            lap: 0,
            currentCp: 0,
            hasFinished: false
          }

          const id = race.participants.push(racer);
          const grid = Races[race.id].grid[id-1];

          //console.log(`${grid[0]}, ${grid[1]}, ${grid[2]}`);
          client.player.vehicle.dimension = RACE_DIMENSION;
          client.player.dimension = RACE_DIMENSION;
          client.setData('isRacer', true, true);
          client.setData('inMission', true, true);
          triggerNetworkEvent('prepareVehicleForRace', client, client.player.vehicle.id, grid[0], grid[1], grid[2], grid[3]);
          setPlayerControls(client, false);

          Locale.sendMessage(null, false, COLOUR_WHITE, 'race.join', client.name, race.participants.length, Races[race.id].grid.length);
          decho(3, `${client.name} has joined the race! [${race.participants.length}/${Races[race.id].grid.length}]`);
        } else {
          Locale.sendMessage(client, false, COLOUR_RED, 'race.vehicleError', Races[race.id].vehicle, getVehicleNameFromModelId(race.vehicle));
        }
      } else {
        Locale.sendMessage(client, false, COLOUR_RED, 'race.full');
      }
    } else {
      Locale.sendMessage(client, false, COLOUR_RED, 'race.raceNotStarted');
    }
  }

  static removePlayer(client) {
    if (!race.isRunning) {
      const racerId = race.participants.findIndex((element, index) => element.client === client);
      race.participants.splice(racerId, 1);
    }
    client.player.vehicle.dimension = 0;
    client.player.dimension = 0;
    client.removeData('isRacer');
    client.removeData('inMission');
    setPlayerControls(client, true);
  }

  static onCheckpointEnter(event, player, sphere, entered) {
    if (!entered) return;

    const client = getClientFromPlayerElement(player);
    const checkpoint = race.checkpoints.findIndex((element) => element.sphere.instance == sphere.instance);
    const racer = Race.getRacer(client);

    if (typeof(checkpoint) != 'undefined') {
      racer.time.push(sdl.ticks);

      if (checkpoint == racer.currentCp) {
        triggerNetworkEvent('playFrontEndSound', client, 94, 1.0);
        race.checkpoints[checkpoint].sphere.instance.setExistsFor(client, false);
        race.checkpoints[checkpoint].sphere.blip.setExistsFor(client, false);
        racer.currentCp++;
        
        //racer.time.push(sdl.ticks);
        const cpTime = (racer.time[racer.currentCp + race.checkpoints.length * (racer.lap-1)] - racer.time[0]) / 1000;

        Locale.sendMessage(client, false, COLOUR_WHITE, 'race.checkpoint', racer.currentCp, Race.get().checkpoints.length, racer.lap, Race.get().laps, cpTime);
      }

      if (racer.currentCp === race.checkpoints.length) {
        //racer.time.push(sdl.ticks);

        if (racer.lap < Races[race.id].laps) {
          racer.lap++;
          racer.currentCp = 0;

          race.checkpoints.forEach(element => {
            element.sphere.instance.setExistsFor(client, true);
            element.sphere.blip.setExistsFor(client, true);
          });
        } else if (racer.lap === Races[race.id].laps) {
          const player = Player.get(racer.client);
          const winnersNumber = race.winners.push(racer);

          if (winnersNumber == 1) {
            player.increaseWonRaces();
          }

          player.increaseRaces(winnersNumber);

          const time = (racer.time[racer.currentCp + race.checkpoints.length * (racer.lap-1)] - racer.time[0]) / 1000;
          Locale.sendMessage(null, false, COLOUR_WHITE, 'race.finish', client.name, time, race.winners.length, race.participants.length);
          Race.removePlayer(client);

          if (race.winners.length === RACE_WINNERS_TO_WAIT_START) {
            race.counter = RACE_WAIT_TIME_FOR_LATE;
            race.timer = setInterval(Race.printInfo, 1000);
          }
        }
      }

      Race.checkFinish();
    }
  }

  static checkFinish() {
    if (race.winners.length + race.dnf.length >= race.participants.length && race.isRunning) {
      Locale.sendMessage(null, false, COLOUR_WHITE, 'race.finishMessage');
      decho(3, `Race finish table:`);

      race.winners.forEach((racer, index)=> {
        const place = index+1;
        const time = (racer.time[racer.currentCp + race.checkpoints.length * (racer.lap-1)] - racer.time[0]) / 1000;

        Locale.sendMessage(null, false, COLOUR_WHITE, 'race.winners', place, racer.client.name, time);
        decho(3, `${place}. ${racer.client.name} (${time})`);
      });

      race.dnf.forEach((racer, index)=> {
        Locale.sendMessage(null, false, COLOUR_YELLOW, 'race.dnf', racer.client.name);
        decho(3, `${racer.client.name} (DNF)`);
      });

      // Clean race data.
      Race.cleanRaceData();
    }
  }

  static onRaceCorrupted(client) {
    if (race.isRunning) {
      const racer = Race.getRacer(client);

      race.dnf.push(racer);
      Race.checkFinish();
    }
    
    Race.removePlayer(client);
  }
}

addNetworkHandler('OnPickupCollected_C', function(client, pickupId) {
  const pickup = getElementFromId(pickupId);

  if (pickup.getData('checkpoint') == true) Race.onCheckointEnter(client, pickup);
});

addEventHandler('OnPedWasted', function(event, ped, attacker, weapon, pedPiece) {
  const client = getClientFromPlayerElement(ped);

  if (client.getData('isRacer')) {
    Race.onRaceCorrupted(client);
  }
});

addEventHandler('onPlayerQuit', (event, client, disconnectType) => {
  if (client.getData('isRacer')) {
    Race.onRaceCorrupted(client);
  }
});