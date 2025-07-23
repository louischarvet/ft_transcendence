import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Player } from './players.js';
import fetch from 'node-fetch';

// Connexion SQLite pour tournaments.db
const dbPromise = open({
	filename: '../database/db.js',
	driver: sqlite3.Database,
});

// Crée un Player depuis le user-service
async function createPlayerFromUser(name) {
	const res = await fetch(`http://user-service:3000/api/users/${name}`);
	if (!res.ok)
		throw new Error(`User service error: ${res.statusText}`);
	const userData = await res.json();
	return new Player(userData);
}

export class Pool {
	constructor(id, remainingPlaces) {
		this.id = id;
		this.remainingPlaces = remainingPlaces;
		this.players = [];
	}

	// Ajoute un joueur au pool ET dans la DB tournoi
	async addPlayer(player) {
		if (!(player instanceof Player))
			throw new Error("Only Player instances can be added");

		await player.saveInTournamentDB(); // sauvegarde dans players si pas présent
		this.players.push(player);
		const db = await dbPromise;
		await db.run(
		"INSERT INTO pool_players (pool_id, player_id) VALUES (?, ?)",
		[this.id, player.id]
		);
	}

	// Récupère les joueurs du pool depuis DB tournoi
	async getPlayers() {
		const db = await dbPromise;
		const players = await db.all(
			`SELECT * FROM players
			WHERE id IN (SELECT player_id FROM pool_players WHERE pool_id = ?)`,
			[this.id]
		);
		return players;
	}

  // Initialise la base de données du tournoi (players, pools, pool_players)
	static async initializeDatabase() {
	const db = await dbPromise;
	await db.exec(`
		CREATE TABLE IF NOT EXISTS players (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			status TEXT
		);
		CREATE TABLE IF NOT EXISTS pools (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			remainingPlaces INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS pool_players (
			pool_id INTEGER,
			player_id INTEGER,
			FOREIGN KEY (pool_id) REFERENCES pools(id),
			FOREIGN KEY (player_id) REFERENCES players(id)
		);
	`);
	}

}
