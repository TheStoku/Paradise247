const MiniGames = [-1];

addEvent('onMinigamePrepare');

let currentMinigame = -1;

class MiniGame {
    constructor(id, name, task) {
        this.id = id;
        this.name = name;
        this.task = task;
        this.game = {
            teams: [],
            participants: [],
            score: [],
            timer: null,
            counter: 0,
            isRunning: false,
            isLocked: false,
        }

        let count = MiniGames.push(this);

        console.log(`[${count-1}] Minigame ${name} has been loaded!`)
    }

    static get(id) {
        return MiniGames[id];
    }

    static addTeam(id, name) {
        MiniGame.get(id).game.teams.push(name);
        MiniGame.get(id).game.participants.push([]);
        MiniGame.get(id).game.score.push([]);

        console.log(`[${MiniGame.get(id).name}] Added team ${name} to minigame.`)
    }

    static reset(id) {
        id = Number(id);

        currentMinigame = -1;
        MiniGame.get(id).game.participants = [];
        MiniGame.get(id).game.score = [];
        MiniGame.get(id).game.timer = null;
        MiniGame.get(id).game.counter = 0;
        MiniGame.get(id).game.isRunning = false;
        MiniGame.get(id).game.isLocked = false;

        getClients().forEach(client => {
            client.removeData('minigame');
            client.removeData('minigameTeam');
        });
    }

    static prepare(id, client) {
        id = Number(id);

        if (id > 0 && id < MiniGames.length && currentMinigame == -1) {
            MiniGame.reset(id);
            currentMinigame = id;
            MiniGame.get(id).game.isRunning = true,
            triggerEvent('onMinigamePrepare', null, id);
        }
    }

    static end(id) {
        id = Number(id);

        console.log(`Minigame finished`);
        MiniGame.reset(id);
    }

    static countPlayers(id) {
        const teams = MiniGame.get(id).game.teams.length;
        let players = 0;

        for (let index = 0; index < teams; index++) {
            players += MiniGame.get(id).game.participants[index].length;
        }

        return players;
    }

    static join(id, client) {
        id = Number(id);

        //console.log(client.getData('minigame'));

        if (typeof(client.getData('minigame')) !== 'undefined') return;

        
        let players = MiniGame.countPlayers(id);

        console.log(players);

        if (!MiniGame.get(id).game.isLocked) {
            // TODO: Make it more complex.
            let teamId = players % 2 == 0 ? 0 : 1;

            MiniGame.get(id).game.participants[teamId].push(client);
            client.setData('minigame', id);
            client.setData('minigameTeam', teamId);
            message(`${client.name} has joined the ${MiniGame.get(id).game.teams[teamId]}`);
        }
    }
}

addCommandHandler('mgs', (command, params, client) => {
    message("Preparing minigame...");
	MiniGame.prepare(params);
});

addCommandHandler('mge', (command, params, client) => {
    message("Ending minigame...");
	MiniGame.end(params);
});

addCommandHandler('mgj', (command, params, client) => {
    message("Joining minigame...");
	MiniGame.join(params, client);
});

addCommandHandler('mgr', (command, params, client) => {
    message("Resetting minigame...");
	MiniGame.reset(params);
});