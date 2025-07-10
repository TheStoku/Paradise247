new MiniGame(1, "CTF", "Capture the flag");

MiniGame.addTeam(1, 'Red');
MiniGame.addTeam(1, 'Blue');

addEventHandler('onMinigamePrepare', (event, id) => {
    if (id != 1) return;

    message(`Preparing CTF Minigame`);
})

addEventHandler('onPlayerQuit', (event, client, disconnectType) => {

});
/*
addEventHandler('OnPedWasted', function(event, ped, attacker, weapon, pedPiece) {
	if (ped.isType(ELEMENT_PLAYER)) {
        const cameraTimeout = 5000;
        setTimeout(function() {
            spawnPlayer(pedClient, ped.position);
            pedClient.player.dimension = pedClient.index + 1000;
        }, cameraTimeout);

        spawnPlayer(pedClient, dojo.spawn[random].position, dojo.spawn[random].heading);
	}
});*/