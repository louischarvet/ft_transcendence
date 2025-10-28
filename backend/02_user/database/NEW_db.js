//./database/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getUserByName, insertInTable } from '../models/models';

const dbFile = '/usr/src/app/data/users_db';

async function getDB() {
	return await open({
		filename: dbFile,
		driver: sqlite3.Database
	});
}

export async function initDB(fastify) {
	const db = await getDB();

	await db.exec(`
		CREATE TABLE IF NOT EXISTS registered (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT "registered",
			status TEXT NOT NULL DEFAULT "pending",

			played_matches INTEGER NOT NULL DEFAULT 0,
			match_wins INTEGER NOT NULL DEFAULT 0,
			wins_streak INTEGER NOT NULL DEFAULT 0,
			win_rate INTEGER NOT NULL DEFAULT 0,
			tournament_wins INTEGER NOT NULL DEFAULT 0,
			friends	TEXT,
			wallet INTEGER NOT NULL DEFAULT 500,

			picture TEXT NOT NULL DEFAULT "./pictures/BG.webp",

			hashedPassword TEXT NOT NULL,
			email TEXT,

			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS guest (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT "guest",
			status TEXT NOT NULL DEFAULT "available",
			
			played_matches INTEGER NOT NULL DEFAULT 0,
			match_wins INTEGER NOT NULL DEFAULT 0,
			wins_streak INTEGER NOT NULL DEFAULT 0,
			win_rate INTEGER NOT NULL DEFAULT 0,
			tournament_wins INTEGER NOT NULL DEFAULT 0,
			friends	TEXT,
			wallet INTEGER NOT NULL DEFAULT 500,

			picture TEXT NOT NULL DEFAULT "./pictures/BG.webp",

			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	db.registered = {
		table: 'registered',

		async insert(toInsert) { // registered specific
			const time = Math.floor( Date.now() / 1000 );
			const { name, hashedPassword, email } = toInsert;
			await db.run(
				`INSERT INTO ${this.table}(name, hashedPassword, email, created_at) VALUES(?, ?, ?, ?)`,
				[ name, hashedPassword, email, time ]
			);
		},
		async getByName(name) {
			return (
				await db.get(
					`SELECT * FROM ${this.table} WHERE name = ?`,
					[ name ]
				)
			);
		},
		async getById(id) {
			return (
				await db.get(
					`SELECT * FROM ${this.table} WHERE id = ?`,
					[ id ]
				)
			);
		},
		async updateCol(name, col, value) {
			await db.run(
				`UPDATE ${this.table} SET ${col} = ? WHERE name = ?`,
				[ value, name ]
			);
		},
		async updateStatsWinner(id) {
			let { played_matches, match_wins } = await db.get(
				`SELECT played_matches, match_wins FROM ${this.table} WHERE id = ?`,
				[ id ]
			);
			played_matches++;
			match_wins++;
			const win_rate = (match_wins / played_matches) * 100;
			await db.run(
				`UPDATE ${this.table} SET match_wins = ?, wins_streak = (wins_streak + 1),
				played_matches = ?,	win_rate = ? WHERE id = ?`,
				[ match_wins, played_matches, win_rate, id ]
			);
		},
		async updateStatsLoser(id) {
			let { played_matches, match_wins } = await db.get(
				`SELECT played_matches, match_wins FROM ${this.table} WHERE id = ?`, 
				[ userID ]
			);
			played_matches++;
			const win_rate = (match_wins / played_matches) * 100;
			await db.run(
				`UPDATE ${this.table} SET wins_streak = 0, played_matches = ?,
				win_rate = ? WHERE id = ?`,
				[ played_matches, win_rate, id ]
			);
		},
		async delete(name) {
			await db.run(
				`DELETE FROM ${this.table} WHERE name = ?`,
				[ name ]
			);
		},
//		async getCol(col) { // guest only
//		},
		// getUserTournament
	};
}