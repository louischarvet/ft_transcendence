//./database/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { deleteUserInTable, getColumnFromTable, getUserByName, updateStatsLoser,
	updateStatsWinner, getUserById, updateColumn, getUsersTournament } from '../models/models';

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
			return (await getUserByName(this.table, name));
		},
		async getById(id) {
			return (await getUserById(this.table, id));
		},
		async updateCol(col, name, value) {
			return (await updateColumn(this.table, col, name, value));
		},
		async updateStatsW(id) {
			await updateStatsWinner(this.table, id);
		},
		async updateStatsL(id) {
			await updateStatsLoser(this.table, id);
		},
		async delete(name) {
			await deleteUserInTable(this.table, name);
		},
		// cron
		async deletePending(time) {
			await db.run(
				`DELETE FROM ${this.table} WHERE status = 'pending' AND created_at <= ?`,
				[ time ]
			);
		}
	};

	db.guest = {
		table: 'guest',

		async insert(toInsert) { // guest specific
			const time = Math.floor( Date.now() / 1000 );
			await db.run(
				`INSERT INTO ${this.table}(name) VALUES (?)`,
				[toInsert.name]
			);
		},
		async getByName(name) {
			return (await getUserByName(this.table, name));
		},
		async getById(id) {
			return (await getUserById(this.table, id));
		},
		async updateCol(col, name, value) {
			return (await updateColumn(this.table, col, name, value));
		},
		async updateStatsW(id) {
			await updateStatsWinner(this.table, id);
		},
		async updateStatsL(id) {
			await updateStatsLoser(this.table, id);
		},
		async delete(name) {
			await deleteUserInTable(this.table, name);
		},
		async getCol(col) {
			await getColumnFromTable(col, this.table);
		},
	};

	db.tournament = {
		async getUsers(listRegistered, listGuests) {
			return (await getUsersTournament(listRegistered, listGuests));
		},
	}

    await fastify.decorate('db', db);

    await fastify.addHook('onClose', async (instance) => {
		console.log("Database closed")
		await instance.db.close();
	});
}