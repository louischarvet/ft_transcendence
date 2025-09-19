import { Player } from '../models/players.js';
import { getTournamentsWonByUser } from '../models/model.js';

import fetch from 'node-fetch';


/*
		CREATE TABLE IF NOT EXISTS tournament (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		matchs TEXT,
		);

		CREATE TABLE IF NOT EXISTS data_tournament (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			winnerId INTEGER,
			remainingPlaces INTEGER NOT NULL
		);
*/

// //! ajout 19/09/2025
// export async function getUserById(id){

// 	const user = await fetch(`http://user-service:3000/api/users/${id}`, {
// 		method: 'GET',
// 		headers: { 'Content-Type': 'application/json'},
// 	});
// 	if(!user.ok)
// 		reply.code(401).send( { error : 'User not found'});

// 	await user.json();

// 	return reply.code(200).send({
// 		user: user,
// 		message: 'User info'
// 	});
// };

//! ajout 19/09/2025
//Recupere tout les tournoie gagne par un user
export async function getTournamentUserId(request, reply){

	console.log("###### function getTournamentUserId()\n");

	const id = request.params.id;
	console.log("Parametre -> ", request.params.id, "\n");
	const userId = Number(id);
	console.log("userId -> ", userId, "\n");
	if (!userId)
		return reply.code(400).send( { error : 'UserId is required'});

	
	// ON recupere tout les tournoies gqgner par un idUser
	const tournaments = await getTournamentsWonByUser(userId);
	console.log("tournoi gagne par l'userId :", userId," --> ", tournaments, "########\n");

	/*
	tournaments:
	[
		{ id: 1, winnerId: 42},
		{ id: 3, winnerId: 42}
	]
	*/

	if (tournaments === undefined)
		return reply.code(200).send({
			tournaments: [],
			message: 'No tournament wins'
		});		
	// On doit stocker la liste des tournoi gagne par l'user dans une chaine "1;3;6..." pour userId1 par exemple

	//list des ids tounois gagnes correspondant a luserID
	const ids = tournaments.map(({ id }) => id);

	const tournamentWinned = ids.join(';');

	console.log("######\n");
	return reply.code(200).send({
		tournaments: tournamentWinned,
		message: 'Tournaments winned'
	});
};

//! ajout 19/09/2025
export async function launchTournament(request, reply){

	const user = request.user;
	if(!user)
		reply.code(401).send( { error : 'User not Authentified'});

	const body = request.body;
	if (!body)
		reply.code(401).send( { error : 'Body is require'});

	const numberOfMatch = body.nbMatch;
	if (!numberOfMatch)
		reply.code(401).send( { error : 'numberOfMatch is require'});
	
};
