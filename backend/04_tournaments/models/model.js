//./models/tournaments.js
import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

// Récupère tous les tournois gagnés par un user
export async function getTournamentsWonByUser(userId) {
    if (!Number.isInteger(userId) || userId <= 0)
        return [];
	// console.log(db.)
	return await db.get( 'SELECT * FROM data_tournament WHERE winnerId = ?', [userId] );
};
