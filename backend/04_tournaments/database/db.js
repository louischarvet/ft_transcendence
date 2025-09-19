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
		matchs TEXT
		);

		CREATE TABLE IF NOT EXISTS data_tournament (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			winnerId INTEGER,
			remainingPlaces INTEGER NOT NULL
		);
	`);
	return db;
}
