import { Player } from './players.js';

export class Pool {
	constructor(id, remainingPlaces) {
	this.id = id;
	this.remainingPlaces = remainingPlaces;
	this.players = [];
	}

	addPlayer(player) {
		if (player instanceof Player)
			this.players.push(player);
		else
			throw new Error("Only Player instances can be added");
	}

	getPlayers() {
		return this.players;
	}
}
