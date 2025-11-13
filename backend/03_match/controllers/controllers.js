//controllers/controllers.js

import { fetchChangeStatus, fetchUpdateStats, fetchCreateGuest }
	from './fetchFunctions.js';

// Route POST pour creer un match contre un joueur inscrit
export async function registeredMatch(request, reply) {
	const { db } = request.server;
	const { name, password } = request.body;
	const player1 = request.user;
	const body = JSON.stringify({
		name: name,
		password: password,
		tmp: true,
	});
	const p2LoginRes = await fetch('http://user-service:3000/login', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: body,
	});
	if (!p2LoginRes.ok)
		return (p2LoginRes);
	const player2 = (await p2LoginRes.json()).user;

	const user1 = await fetchChangeStatus(player1, 'in_game');
	const user2 = await fetchChangeStatus(player2, 'in_game');

	const match = await db.matches.insert({
		p1_id: player1.id,
		p1_type: player1.type,
		p2_id: player2.id,
		p2_type: 'registered',
		tournament_id: 0
	});

	return reply.code(200).send({
		match: match,
		user1: user1,
		user2: user2,
		message: 'Registered match successfully created',
	});

}

// Route POST pour creer un match contre un guest
export async function guestMatch(request, reply) {
	const { db } = request.server;
	const player1 = request.user;

	const guest = await fetchCreateGuest();
	const user = await fetchChangeStatus(player1, 'in_game');

	const match = await db.matches.insert({
		p1_id: player1.id,
		p1_type: player1.type,
		p2_id: guest.id,
		p2_type: 'guest',
		tournament_id: 0
	});

	return reply.code(200).send({
		match: { ...match,p1_name: user.name, p2_name: guest.name},
		user1: user,
		user2: guest,
		message: 'Guest match successfully created',
	});
}

// Route POST pour creer un match contre IA
export async function iaMatch(request, reply) {
	const { db } = request.server;
	const player1 = request.user;
	const iaID = 0;

	const user = await fetchChangeStatus(player1, 'in_game');

	const match = await db.matches.insert({
		p1_id: player1.id,
		p1_type: player1.type,
		p2_id: iaID,
		p2_type: 'ia',
		tournament_id: 0
	});

	return reply.code(200).send({
		match: match,
		user1: user,
		user2: {
			id: 0,
			type: 'ia',
		},
		message: 'IA match successfully created',
	});
}

// Route GET pour recuperer l'historique des matchs d'un joueur par son ID
export async function getHistory(request, reply) {
	const { db } = request.server;
	const userID = request.params.id; // parser les params ?
	if (userID === undefined)
		return reply.code(400).send({ error: 'No ID in params.' });
	else if (!(/^[0-9]+$/.test(userID)))
		return reply.code(400).send({ error: 'Invalid ID format.' });

	const history = await db.history.getByUserID(userID);
	return reply.code(200).send(history);
}

// Route PUT pour mettre fin au match, update les infos necessaires
export async function finish(request, reply) {
	const { db } = request.server;
	const match = request.body;

	const { scoreP1, scoreP2, p1_id, p1_type, p2_id, p2_type } = match;
	const winner_id = scoreP1 > scoreP2 ? p1_id : p2_id;
	const winner_type = scoreP1 > scoreP2 ? p1_type : p2_type;

	const loser_id = scoreP1 > scoreP2 ? p2_id : p1_id;

	match.winner_id = winner_id;
	match.winner_type = winner_type;
	match.loser_id = loser_id;

	if (await db.matches.get('id', match.id) === undefined)
		return reply.code(400).send({ error: 'There is no match with this ID.' });

	const historyMatch = db.history.insert(match);
	await db.matches.delete('id', match.id);

	let { user1, user2 } = await fetchUpdateStats(p1_id, p1_type, p2_id, p2_type, winner_id);
	
	return reply.code(200).send({
		user1: user1,
		user2: user2,
		match: historyMatch,
		message: 'Finished match.'
	});
}

export async function abort(request, reply) {
	const { db } = request.server;
	const { user_id } = request.body;

	db.matches.delete('p1_id', user_id);
	db.matches.delete('p2_id', user_id);

	return reply.code(200).send({
		ok: true
	});
}

// Route POST pour creer un match avec IDs des joueurs deja definis (via tournament)	
export async function tournamentMatch(request, reply) {
	const { db } = request.server;
	const { player1, player2, tournamentID } = request.body;

	const match = await db.matches.insert({
		p1_id: player1.id,
		p1_type: player1.type,
		p2_id: player2.id,
		p2_type: player2.type,
		tournament_id: tournamentID
	});

	// change status to in_game

	return reply.code(200).send({
		match: match,
		message: 'Tournament match created'
	});
}

// route GET pour recuperer les match d'un tournoi
export async function getHistoryByTournamentID(request, reply) {
	const { db } = request.server;
	const tournamentId = request.params.id;
	if (!tournamentId)
		return reply.code(200).send({ error : 'Need tournament Id' });
	
	const tournamentData = await db.history.getByTournamentID(tournamentId);
	if (!tournamentData) 
		return reply.code(200).send({ error : 'No data for this tournament' });
	return reply.code(200).send({ tournamentData });
}

// Route GET pour récupérer tous les matches
// route /matches
// export async function getAllMatchesController(request, reply) {
// 	const matches = await getAllMatches();
// 	return reply.code(200).send({ matches });
// }

// Route GET pour récupérer un match par son ID
// route /matches/:id
export async function getMatchById(request, reply) {
	const { db } = request.server;
	const match = await db.matches.get('id', request.params.id);
	return reply.code(200).send({ match });
}

// // Route PUT pour mettre à jour le résultat d'un match
// // route /matches/:id/result
// export async function updateMatchResultController(request, reply) {
// 	const match = await updateMatchResult(request.params.id, request.body.scoreP1, request.body.scoreP2, request.body.winner_id);
// 	return reply.code(200).send({ match });
// }
