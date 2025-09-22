//./database/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
	const db = await open({
		filename: '/usr/src/app/data/tournament_db',
		driver: sqlite3.Database
	});
	await db.exec(`

		CREATE TABLE IF NOT EXISTS tournament (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		status TEXT DEFAULT 'waiting',
		matchs TEXT,
		players TEXT DEFAULT '',
		winnerId INTEGER,
		nbPlayersTotal INTEGER NOT NULL,
		remainingPlaces INTEGER NOT NULL,
		created_at INTEGER NOT NULL
		);
	`);
	return db;
}