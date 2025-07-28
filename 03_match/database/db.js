import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = __dirname + '/db';

export async function getDb() {
	return open({
		filename: dbPath,
		driver: sqlite3.Database
	});
}

export async function initializeDatabase() {
	const db = await getDb();

	// ID du match ?
	// FOREIGN KEY et REFERENCES ne marchent que si la table referencee
	// existe dans la meme database

	// player2 doit il etre obligatoire ? Si c'est un match contre l'IA ?
	await db.exec(`
		CREATE TABLE IF NOT EXISTS matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		tournament_id INTEGER,
		player1 TEXT NOT NULL,
		player2 TEXT NOT NULL,
		winner TEXT,
		FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
		);
	`);

	return db;
}

export async function createMatch(p1Name, p2Name) {
	const db = await getDb();

	console.log('player1:', p1Name, typeof p1Name, ' player2:', p2Name, typeof p2Name);

	if (!p1Name || !p2Name) {
		console.log('player1 ou player2 NULL');
    //    throw new Error('Player names cannot be null or empty');
    }

	// autres valeurs ?
	await db.run(`
		INSERT INTO matches(player1, player2) VALUES(?, ?);
	`, [p1Name, p2Name]);
}