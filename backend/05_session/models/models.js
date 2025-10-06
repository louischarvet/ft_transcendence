
import { getDB } from '../database/db.js';

const db = await getDB();

export async function initDB() {
//	const db = await getDB();
	// a modifier en fonction des necessites
	await db.exec(`
		CREATE TABLE IF NOT EXISTS refresh (
			jwti TEXT NOT NULL,
			user_id	INTEGER NOT NULL
		);
	`);
//	return db;
}

export async function insertRefresh(jwti, user_id) {
    await db.run(`INSERT INTO refresh(jwti, user_id) VALUES(?, ?)`,
        [ jwti, user_id ]);
}

export async function getRefresh(jwti, user_id) {
	return await db.get(`SELECT * FROM refresh WHERE jwti = ? AND user_id = ?`,
		[ jwti, user_id ]);
}

export async function deleteRefresh(jwti, user_id) {
	await db.run(`DELETE FROM refresh WHERE jwti = ? AND user_id = ?`,
		[ jwti, user_id ]);
}