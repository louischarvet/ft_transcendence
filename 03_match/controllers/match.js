//controllers/match/js
import { Match } from '../models/match.js';

// Fonction pour ajouter un match
async function addMatch(match) {
	try {
		const { poolId, player1, player2 } = match;
		return await Match.createMatch(poolId, player1, player2);
	} catch (error) {
		throw new Error('Error creating match');
	}
}

// Fonction pour obtenir le prochain match
async function getNextMatch() {
	try {
		const db = await Match.dbPromise;
			return new Promise((resolve, reject) => {
				db.get("SELECT * FROM matches ORDER BY id ASC LIMIT 1", [], (err, row) => {
					if (err)
						reject(err);
					else
						resolve(row);
				});
			});
	} catch (error) {
		throw new Error('Error fetching next match');
	}
}

export { addMatch, getNextMatch };
