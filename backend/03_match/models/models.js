////models/models.js

//// Fonction pour créer un match
//export async function createMatch(p1, p2, match_type) {
//	const result = await db.run(`
//		INSERT INTO matches(player1, player2, match_type) VALUES(?, ?, ?);
//	`, [p1, p2, match_type]);
//	return { id: result.lastID, player1: p1, player2: p2, match_type };
//}

//// Fonction pour recuperer l'historique de matchs d'un joueur par son ID
//export async function getHistoryByUserID(userID) {
//	const history = await db.all(
//		`SELECT * FROM history WHERE p1_id = ? OR p2_id = ?`,
//		[ userID, userID ]);
//	return (history);
//}

//// Fonction pour verifier si un user est dans un match en cours
//export async function getMatchByUserID(userID) {
//	const match = await db.get(
//		`SELECT * FROM matches WHERE p1_id = ? OR p2_id = ?`,
//		[ userID, userID ]);
//	return (match);
//}

//// Fonction pour inserer un match dans la table history
//export async function insertInHistory(match) {
//	const { id, p1_id, p1_type, scoreP1, p2_id, p2_type,
//		scoreP2, winner_id, loser_id, created_at } = match;
//	let { tournament_id } = match;
//	tournament_id = tournament_id === undefined ? 0 : tournament_id;

//	const date = Date().toLocaleString('fr-FR');
//	const shortDate = date.split(" GMT")[0];
//	await db.run(
//		`INSERT INTO history(id, p1_id, p1_type, scoreP1, p2_id, p2_type,
//		scoreP2, winner_id, loser_id, created_at, ended_at, tournament_id)
//		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//		[ id, p1_id, p1_type, scoreP1, p2_id, p2_type, scoreP2, winner_id,
//			loser_id, created_at, shortDate, tournament_id ]
//	);

//	return (await db.get(`SELECT * FROM history WHERE p1_id = ? AND p1_type = ? AND p2_id = ?
//		AND created_at = ? AND ended_at = ?`, [ p1_id, p1_type, p2_id, created_at, shortDate ]));
//}

//// Fonction pour supprimer un match de la table matches
//export async function deleteMatch(matchID) {
//	await db.run('DELETE FROM matches WHERE id = ?', [ matchID ]);
//}

//// Fonction pour récupérer tous les matches
//export async function getAllMatches() {
//	const matches = await db.all(`SELECT * FROM matches`);
//	return matches;
//}

//// Fonction pour récupérer un match par son ID
//export async function getMatch(id) {
//	const match = await db.get(`SELECT * FROM matches WHERE id = ?`, [id]);
//		return match;
//}

//// Fonction pour mettre à jour le résultat d'un match
//export async function updateMatchResult(id, scoreP1, scoreP2, winner_id) {
//	await db.run(`
//		UPDATE matches SET scoreP1 = ?, scoreP2 = ?, winner_id = ? WHERE id = ?;
//	`, [scoreP1, scoreP2, winner_id, id]);
//	return { success: true, message: 'Match result updated' };
//}

//// Fonction pour créer un match local
//export async function createLocalMatch(p1, p2) {
//	const result = await db.run(`
//		INSERT INTO local(player1, player2) VALUES(?, ?);
//	`, [p1, p2]);
//	return { id: result.lastID, player1: p1, player2: p2, match_type: 'local' };
//}

//// Fonction pour créer un match vs (ajoutée)
//export async function createVsMatch(p1, p2) {
//	return await createMatch(p1, p2, 'vs');
//}


//export async function insertInTable(table, p1_id, p1_type, p2_id, p2_type, tournamentID) {
////	const time = Math.floor( Date.now() / 1000 );
//	const date = Date().toLocaleString('fr-FR');
//	const shortDate = date.split(" GMT")[0];
//	await db.run(
//		`INSERT INTO ` + table + `(p1_id, p1_type, p2_id, p2_type, created_at, tournament_id)
//		VALUES(?, ?, ?, ?, ?, ?)`,	[ p1_id, p1_type, p2_id, p2_type, shortDate, tournamentID ]
//	);
//	return (await db.get(
//		`SELECT * FROM ` + table + ` WHERE p1_id = ? AND p2_id = ? AND created_at = ? AND tournament_id = ?`,
//		[ p1_id, p2_id, shortDate, tournamentID ]
//	));
//}

//export async function getMatchByID(matchID) {
//	return (await db.get(`SELECT * FROM matches WHERE id = ?`, [ matchID ]));
//}

////!ajout le 29/09/2025 pour recupérer l'historique des match appartemenant a un tournoi
//export async function getHistoryTournamentID(tournamentID) {
//	const history = await db.all(
//		`SELECT * FROM history WHERE tournament_id = ?`, [ tournamentID ]);
//	return (history);
//}