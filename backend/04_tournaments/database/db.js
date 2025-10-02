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
			creatorId INTEGER NOT NULL,
			status TEXT DEFAULT 'waiting',
			matchs TEXT DEFAULT '',
			players TEXT DEFAULT '',
			rounds INTEGER DEFAULT 1,
			nbPlayersTotal INTEGER NOT NULL,
			remainingPlaces INTEGER NOT NULL,
			created_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS history (
			id INTEGER NOT NULL,
			matchs TEXT,
			players TEXT,
			ranking TEXT,
			winnerId INTEGER default NULL,
			ended_at TEXT,
			created_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS round (
			tournament_id	INTEGER NOT NULL,
			round INTEGER DEFAULT 1,
			matchs TEXT DEFAULT '',
			players	TEXT DEFAULT ''
		);
	`);
	return db;
}