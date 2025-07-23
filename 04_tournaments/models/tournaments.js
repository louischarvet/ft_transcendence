//./models/tournaments.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Player } from './players.js';
import fetch from 'node-fetch';

const dbPath = "/usr/src/app/database/db";

async function getDB() {
	return open({
		filename: dbPath,
		driver: sqlite3.Database
	});
}

// Crée un Player depuis le user-service
async function createPlayerFromUser(name) {
	const res = await fetch(`http://user-service:3000/api/users/${name}`);
	if (!res.ok)
		throw new Error(`User service error: ${res.statusText}`);
	const userData = await res.json();
	return new Player(userData);
}


export  class Pool {
	constructor(id, remainingPlaces) {
		this.id = id;
		this.remainingPlaces = remainingPlaces;
		this.players = [];
	}
//	// Ajoute un joueur au pool ET dans la DB tournoi
	async addPlayer(player) {
		const db = await getDB();
		if (!(player instanceof Player))
			throw new Error("Only Player instances can be added");

		await player.saveInTournamentDB(); // sauvegarde dans players si pas présent
		this.players.push(player);
		await db.run(
			"INSERT INTO pool_players (pool_id, player_id) VALUES (?, ?)",
			[this.id, player.id]
		);
	}

//	// Récupère les joueurs du pool depuis DB tournoi
	async getPlayers() {
		const db = await getDB();
		const players = await db.all(
			`SELECT * FROM players
			WHERE id IN (SELECT player_id FROM pool_players WHERE pool_id = ?)`,
			[this.id]
		);
		return players;
	}

//  // Initialise la base de données du tournoi (players, pools, pool_players)
}
