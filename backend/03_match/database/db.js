// database/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbFile = '/usr/src/app/data/matches_db';

async function getDB() {
    return await open({
        filename: dbFile,
        driver: sqlite3.Database
    });
}

export async function initDB(fastify) {
    const db = await getDB();

    await db.exec(`
		CREATE TABLE IF NOT EXISTS matches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,

			p1_id INTEGER NOT NULL,
			p1_type TEXT NOT NULL,

			p2_id INTEGER,
			p2_type TEXT NOT NULL,

			tournament_id INTEGER NOT NULL DEFAULT 0,

			created_at TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS history (
			id INTEGER,

			p1_id INTEGER NOT NULL,
			p1_type TEXT NOT NULL,
			scoreP1 INTEGER DEFAULT 0,

			p2_id INTEGER,
			p2_type TEXT NOT NULL,
			scoreP2 INTEGER DEFAULT 0,

			tournament_id INTEGER NOT NULL DEFAULT 0,

			winner_id INTEGER NOT NULL,
			loser_id INTEGER NOT NULL,

			created_at TEXT NOT NULL,
			ended_at TEXT NOT NULL
		);
	`);

	db.matches = {
		table: 'matches',

		async insert(match) {
			const { p1_id, p1_type, p2_id, p2_type, tournament_id } = match;
			const date = Date().toLocaleString('fr-FR');
			const shortDate = date.split(" GMT")[0];
			await db.run(
				`INSERT INTO ${this.table}(p1_id, p1_type, p2_id, p2_type,
				tournamentID, created_at) VALUES(?, ?, ?, ?, ?, ?)`,
				[ p1_id, p1_type, p2_id, p2_type, tournament_id, shortDate ]
			);
			return (await db.get(
				`SELECT * FROM ${this.table} WHERE p1_id = ? AND p2_id = ?
				AND created_at = ? AND tournament_id = ?`,
				[ p1_id, p2_id, shortDate, tournament_id ]
			));
		},
		async delete(matchID) {
			await db.run(
				`DELETE FROM ${this.table} WHERE id = ?`,
				[ matchID ]
			);
		},
		async getByID(matchID) {
			return (await db.get(
				`SELECT * FROM ${this.table} WHERE id = ?`,
				[ matchID ]));
		}
	}

	db.history = {
		table: 'history',

		async insert(match) {
			const { id, p1_id, p1_type, scoreP1, p2_id, p2_type,
				scoreP2, winner_id, loser_id, created_at } = match;
			let { tournament_id } = match;
			tournament_id = tournament_id === undefined ? 0 : tournament_id;
			const date = Date().toLocaleString('fr-FR');
			const shortDate = date.split(" GMT")[0];

			await db.run(
				`INSERT INTO history(id, p1_id, p1_type, scoreP1, p2_id,
				p2_type, scoreP2, winner_id, loser_id, created_at, ended_at,
				tournament_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[ id, p1_id, p1_type, scoreP1, p2_id, p2_type, scoreP2,
				winner_id, loser_id, created_at, shortDate, tournament_id ]
			);

			return (await db.get(
				`SELECT * FROM history WHERE p1_id = ? AND p1_type = ?
				AND p2_id = ? AND created_at = ? AND ended_at = ?`,
				[ p1_id, p1_type, p2_id, created_at, shortDate ]
			));
		},
		async getByUserID(userID) {
			return (await db.all(
				`SELECT * FROM history WHERE p1_id = ? OR p2_id = ?`,
				[ userID, userID ]
			));
		},
		async getByTournamentID(tournamentID) {
			return (await db.all(
				`SELECT * FROM history WHERE tournament_id = ?`,
				[ tournamentID ]
			));
		}
	}

	await fastify.decorate('db', db);

	await fastify.addHook('onClose', async (instance) => {
		await instance.db.close();
	});
}