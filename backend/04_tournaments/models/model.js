//./models/tournaments.js
import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

//! ajout le 20/09/2025
export async function createTournamentRow({ nbPlayersTotal}) {

	const time = Math.floor(Date.now() / 1000);

	const result = await db.run(
		`INSERT INTO tournament (created_at, nbPlayersTotal, remainingPlaces)
		VALUES (?, ?, ?)`,
		[time, nbPlayersTotal, nbPlayersTotal]
	);

	return await db.get(`SELECT * FROM tournament WHERE id = ?`, [result.lastID]);
}

export async function getTournament(id){
	return await db.get(`SELECT * FROM tournament WHERE id = ?`, [id]);
};

//lancer le tournoie
export async function startTournamentInternal(tournamentId) {
	const tournament = await getTournament(tournamentId);
	if (!tournament || tournament.status !== 'waiting')
		return null;

	await db.run(`UPDATE tournament SET status = 'started' WHERE id = ?`, [tournamentId]);
	return await getTournament(tournamentId);
}

//ajoute un joueur a la db et enleve un joueur au nb places restantes
export async function addPlayerToTournament(tournamentId, players, playerType) {
	if (players === -1 && playerType === 'ia')
		await db.run(`UPDATE tournament SET remainingPlaces = remainingPlaces - 1 WHERE id = ?`, [tournamentId]);
	else if(playerType === 'user')
		await db.run(`UPDATE tournament SET players = ?, remainingPlaces = remainingPlaces - 1 WHERE id = ?`, [players, tournamentId]);
	else
		return null;
	return await getTournament(tournamentId);
}

// Récupère tous les tournois gagnés par un user
export async function getTournamentsWonByUser(userId) {
    if (!Number.isInteger(userId) || userId <= 0)
        return [];
	// console.log(db.)
	return await db.all( 'SELECT * FROM tournament WHERE winnerId = ?', [userId] );
};

//! ajout le 22/09/2025
//pour matchsevice ?!!
export async function setMatchesForTournament(id, matchesString) {
	await db.run(`UPDATE tournament SET matches = ? WHERE id = ?`, [matchesString, id]);
	return await getTournament(id);
}

//pour matchsevice ?!!
export async function setTournamentWinner(id, winnerId) {
	await db.run(`UPDATE tournament SET winnerId = ?, status = 'finished' WHERE id = ?`, [winnerId, id]);
	return await getTournament(id);
}


//pour matchsevice ?!!
export async function updateMatchAndPlaces(tournamentId, newMatches, newPlayers) {
	await db.run(`UPDATE tournament SET matches = ?, nbPlayersTotal = nbPlayersTotal - 1, players = ? WHERE id = ?`, [newMatches, newPlayers, tournamentId]);
	return await getTournament(tournamentId);
};	