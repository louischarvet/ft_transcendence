//models/models.js
import { getDB } from '../common_tools/getDB.js';	


//CRUD des matches
// Fonction pour créer un match
export async function createMatch(p1, p2, match_type) {
	const db = await getDB();
	const result = await db.run(`
		INSERT INTO matches(player1, player2, match_type) VALUES(?, ?, ?);
	`, [p1, p2, match_type]);
	return { id: result.lastID, player1: p1, player2: p2, match_type };
}

// Fonction pour récupérer tous les matches
export async function getAllMatches() {
	const db = await getDB();
	const matches = await db.all(`SELECT * FROM matches`);
	return matches;
}

// Fonction pour récupérer un match par son ID
export async function getMatch(id) {
	const db = await getDB();
	const match = await db.get(`SELECT * FROM matches WHERE id = ?`, [id]);
		return match;
}

// Fonction pour mettre à jour le résultat d'un match
export async function updateMatchResult(id, scoreP1, scoreP2, winner_id) {
	const db = await getDB();
	await db.run(`
		UPDATE matches SET scoreP1 = ?, scoreP2 = ?, winner_id = ? WHERE id = ?;
	`, [scoreP1, scoreP2, winner_id, id]);
	return { success: true, message: 'Match result updated' };
}

// Fonction pour créer un match local
export async function createLocalMatch(p1, p2) {
	const db = await getDB();
	const result = await db.run(`
		INSERT INTO local(player1, player2) VALUES(?, ?);
	`, [p1, p2]);
	return { id: result.lastID, player1: p1, player2: p2, match_type: 'local' };
}

// Fonction pour créer un match vs (ajoutée)
export async function createVsMatch(p1, p2) {
	return await createMatch(p1, p2, 'vs');
}
