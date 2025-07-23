//controllers/match/js

export class Match {
	constructor(poolId, player1, player2) {
		this.poolId = poolId;
		this.player1 = player1;
		this.player2 = player2;
	}

	static async createMatch(poolId, player1, player2) {
		const db = await dbPromise;
		const result = await db.run(
			"INSERT INTO matches (poolId, player1, player2) VALUES (?, ?, ?)",
			[poolId, player1, player2]
		);
		return { id: result.lastID, poolId, player1, player2 };
	}

	static async initializeDatabase() {
		const db = await dbPromise;
		await db.exec(`
			CREATE TABLE IF NOT EXISTS matches (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				poolId INTEGER NOT NULL,
				player1 TEXT NOT NULL,
				player2 TEXT NOT NULL
			)
		`);
	}
}


/*Exemple appel api ? a voir si fonctionne */
/*
	curl -X POST http://match-service:3002/matches \
	-H "Content-Type: application/json" \
	-d '{"poolId": 1, "player1": "alice", "player2": "bob"}'
*/