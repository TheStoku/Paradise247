new MiniGame(2, "A/D", "Attack and defense");

MiniGame.addTeam(2, 'Red');
MiniGame.addTeam(2, 'Blue');

addEventHandler('onMinigamePrepare', (event, id) => {
    if (id != 2) return;
    message(`Preparing AD Minigame`);
})

addEventHandler('onPlayerQuit', (event, client, disconnectType) => {

});

addEventHandler('OnPedWasted', function(event, ped, attacker, weapon, pedPiece) {
	if (ped.isType(ELEMENT_PLAYER)) {
        setTimeout(function() {
            spawnPlayer(pedClient, ped.position);
            pedClient.player.dimension = pedClient.index + 1000;
        }, cameraTimeout);

        spawnPlayer(pedClient, dojo.spawn[random].position, dojo.spawn[random].heading);
	}
});