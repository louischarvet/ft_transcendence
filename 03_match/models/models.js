//models/models.js
import { getDB } from '../common_tools/getDB.js';	

export async function setMatch(p1, p2, match_type) {
	const db = await getDB();
//! ? uniquement pour les valeurs

	const table = (match_type === 'local' ? 'local' : 'matches')
	await db.run(`
		INSERT INTO ?(player1, player2) VALUES(?, ?);
	`, table, p1, p2);
}
//	static async createMatch(poolId, player1, player2) {
//		const db = await dbPromise;
//		const result = await db.run(
//			"INSERT INTO matches (poolId, player1, player2) VALUES (?, ?, ?)",
//			[poolId, player1, player2]
//		);
//		return { id: result.lastID, poolId, player1, player2 };
//	}

//	static async initializeDatabase() {
//		const db = await dbPromise;
//		await db.exec(`
//			CREATE TABLE IF NOT EXISTS matches (
//				id INTEGER PRIMARY KEY AUTOINCREMENT,
//				poolId INTEGER NOT NULL,
//				player1 TEXT NOT NULL,
//				player2 TEXT NOT NULL
//			)
//		`);
	//}


/*Exemple appel api ? a voir si fonctionne */
/*
	curl -X POST http://match-service:3002/matches \
	-H "Content-Type: application/json" \
	-d '{"poolId": 1, "player1": "alice", "player2": "bob"}'
*/
