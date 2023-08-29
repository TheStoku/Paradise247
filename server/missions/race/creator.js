class TrackCreator {
  constructor(client) {
    this.client = client;
    this.track = {
      name: "Undefined",
      author: client.name,
      vehicle: -1,
      laps: 1,
      grid: [],
      checkpoints: [],
    }
  }

  setName(name) {
    this.track.name = name;
    messageClient(`[TrackCreator] Changed track name to ${name}`, this.client, COLOUR_WHITE);
  }

  setVehicle(vehicle) {
    this.track.vehicle = Number(vehicle);
    messageClient(`[TrackCreator] Changed vehicle model to ${vehicle} (${getVehicleNameFromModelId(this.track.vehicle)})`, this.client, COLOUR_WHITE);
  }

  setLaps(laps) {
    this.track.laps = Number(laps);
    messageClient(`[TrackCreator] Changed number of laps to ${laps}`, this.client, COLOUR_WHITE);
  }

  addGrid() {
    const player = this.client.player;
    const grid = [ player.position.x, player.position.y, player.position.z, player.heading];
    this.track.grid.push(grid);

    messageClient(`[TrackCreator] Added grid. Current number of grids: ${this.track.grid.length}`, this.client, COLOUR_WHITE);
  }
  
  removeGrid(id) {
    if (parseInt(id)) {
      this.track.grid.splice(Number(id), 1);
      messageClient(`[TrackCreator] Deleted Grid ${id}. Current number of Grids: ${this.track.grid.length}`, this.client, COLOUR_WHITE);
    } else if (id === "*") {
      this.track.grid = [];
      messageClient(`[TrackCreator] Deleted all Grids. Current number of Grids: ${this.track.grid.length}`, this.client, COLOUR_WHITE);
    }
  }

  addCheckpoint() {
    const player = this.client.player;
    const cp = [ player.position.x, player.position.y, player.position.z, player.heading];
    this.track.checkpoints.push(cp);

    messageClient(`[TrackCreator] Added checkpoint. Current number of checkpoints: ${this.track.checkpoints.length}`, this.client, COLOUR_WHITE);
  }
  
  removeCheckpoint(id) {
    if (parseInt(id)) {
      this.track.checkpoints.splice(Number(id), 1);
      messageClient(`[TrackCreator] Deleted Checkpoint ${id}. Current number of Checkpoints: ${this.track.checkpoints.length}`, this.client, COLOUR_WHITE);
    } else if (id === "*") {
      this.track.checkpoints = [];
      messageClient(`[TrackCreator] Deleted all Checkpoints. Current number of Checkpoints: ${this.track.checkpoints.length}`, this.client, COLOUR_WHITE);
    }
    
  }

  save() {
    //console.log(objectToTrack(this.track));

		saveTextFile(`server/missions/race/custom/${this.client.name}/${this.track.name}.js`, objectToTrack(this.track));
    messageClient(`[TrackCreator] The track has been saved as "${this.client.name}/${this.track.name}".`, this.client, COLOUR_WHITE);
  }
}

function objectToTrack(object) {
  let string = `const ${object.name} =\n{\n`;

  Object.keys(object).forEach(key => {
    string += `  ${key}: `;

    switch (typeof(object[key])) {
      case 'string':
        string += `"${object[key]}",\n`;
        break;
      case 'number':
        string += `${object[key]},\n`;
        break;
      case 'object':
        string += `[\n`;
        Object.keys(object[key]).forEach(key2 => {
          string += `    [${Object.values(object[key][key2])}],\n`;
        });
        string += `  ],\n`;
        break;
      }
    });
  
  string += `}\n\nnew Race(${object.name});`;
  return string;
}