//./database/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
//import { insert, get, erase } from '../models/models.js'

// Chemin vers le fichier de base de données SQLite
const dbFile = '/usr/src/app/data/session_db';

async function getDB() {
	return await open({
		filename: dbFile,
		driver: sqlite3.Database
	});
}

export async function initDB(fastify) {
	console.log("######### SESSION: opening db...");
	const db = await getDB();
	// a modifier en fonction des necessites
	await db.exec(`
		CREATE TABLE IF NOT EXISTS refresh (
			jwti TEXT NOT NULL,
			user_id	INTEGER NOT NULL
		);
	`);

	// attacher les fonctions models a l'objet db
	db.refresh = {
		async insert(jwti, user_id) {
    		await db.run(`INSERT INTO refresh(jwti, user_id) VALUES(?, ?)`,
        		[ jwti, user_id ]);
		},
		async get(jwti, user_id) {
			return await db.get(`SELECT * FROM refresh WHERE jwti = ? AND user_id = ?`,
				[ jwti, user_id ]);
		},
		async erase(jwti, user_id) {
			await db.run(`DELETE FROM refresh WHERE jwti = ? AND user_id = ?`,
				[ jwti, user_id ]);
		}
	};

	// attacher la db a fastify pour pouvoir y acceder a partir de request
    await fastify.decorate('db', db);
	
	console.log("################## initDB\n", fastify.db,
				"\n#########################\n");
//	console.log("hasDecorator: ", fastify,hasDecorator('db'));
//	console.log("################################################## fastify\n", fastify,
//				"\n#########################################################\n");
	// fermeture
    await fastify.addHook('onClose', async (instance) => {
		console.log("Database closed")
		await instance.db.close();
	});

//	return db;
}