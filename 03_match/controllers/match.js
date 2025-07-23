//controllers/match/js

import { Match } from '../models/match.js';
//import fetch from 'node-fetch';

// Fonction utilitaire pour vérifier si un joueur existe dans user-service
//  APIT REST ?
async function userExists(username) {
	const res = await fetch(`http://user-service:3000/exists?name=${username}`);
	return res.ok;
}

// Fonction pour ajouter un match
async function addMatch(match) {
	try {
		const { poolId, player1, player2 } = match;

		// test si les deux joueurs existent 
		const [exists1, exists2] = await Promise.all([
			userExists(player1),
			userExists(player2)
		]);

		if (!exists1 || !exists2)
			throw new Error('Un ou plusieurs joueurs sont inconnus.');

		// creer match
		return await Match.createMatch(poolId, player1, player2);
	} catch (error) {
		throw new Error('Error creating match: ' + error.message);
	}
}

export { addMatch };
