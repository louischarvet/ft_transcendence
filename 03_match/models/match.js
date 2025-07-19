//controllers/match/js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Ouvre une connexion à la base de données SQLite
const dbPromise = open({
	filename: './mydatabase.db',
	driver: sqlite3.Database
});

// Classe Match
export class Match {
	constructor(poolId, player1, player2) {
	this.poolId = poolId;
	this.player1 = player1;
	this.player2 = player2;
	}

	// Méthode pour sauvegarder un match dans la base de données
	static async createMatch(poolId, player1, player2) {
	const db = await dbPromise;
	const result = await db.run(
		"INSERT INTO matches (poolId, player1, player2) VALUES (?, ?, ?)",
		[poolId, player1, player2]
	);
	return { id: result.lastID, poolId, player1, player2 };
	}

	// Méthode pour initialiser la base de données
	static async initializeDatabase() {
	const db = await dbPromise;
	await db.exec(`
		CREATE TABLE IF NOT EXISTS matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		poolId INTEGER NOT NULL,
		player1 TEXT NOT NULL,
		player2 TEXT NOT NULL
		)
	`);
	}
}
