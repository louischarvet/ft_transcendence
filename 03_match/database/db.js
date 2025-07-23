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
