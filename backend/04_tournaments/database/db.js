//./database/db.js

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
	return db;
}


//export async function initializeDatabase() {
//	const db = await getDb();

//	await db.exec(`
//		CREATE TABLE IF NOT EXISTS tournaments (
//		id INTEGER PRIMARY KEY AUTOINCREMENT,
//		name TEXT NOT NULL,
//		created_at TEXT DEFAULT CURRENT_TIMESTAMP
//		);
//	`);

//	return db;
//}

//echo 'CREATE TABLE' | sqlite3 mydb