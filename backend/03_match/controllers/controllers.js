//controllers/controllers.js

import { insertInTable, getHistoryByUserID, insertInHistory, deleteMatch, getMatchByID } from '../models/models.js';
// import { createLocalMatch, createVsMatch, getAllMatches, getMatch, updateMatchResult } from '../models/models.js';

// Requete a user-service pour update le status d'un joueur
async function fetchChangeStatus(player, status) {
	const body = JSON.stringify({
		name: player.name,
		id: player.id,
		status: status,
		type: player.type,
	});

	const res = await fetch('http://user-service:3000/changestatus', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: body,
	});
	if (!res.ok)
		return res;
	return ((await res.json()).user);
}

// Requete a user-service pour mettre a jour les stats d'un ou deux joueurs
async function fetchUpdateStats(p1_id, p1_type, p2_id, p2_type, winner_id) {
	const body = JSON.stringify({
		p1_id: p1_id,
		p1_type: p1_type,
		p2_id: p2_id,
		p2_type: p2_type,
		winner_id: winner_id,
	});

	const res = await fetch('http://user-service:3000/updatestats', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: body,
	});
	const resBody = await res.json();
	const user = resBody.user;
	// console.log("############################ festchUpdateStats Res\n",
	// 			"##### BODY\n", resBody,
	// 			"##########\n",
	// 			"##### USER\n", user,
	// 			"##########\n");
	return (user);
}

// Route POST pour creer un match contre un joueur inscrit
export async function registeredMatch(request, reply) {
	const { name, password } = request.body;
	const player1 = request.user;
	const body = JSON.stringify({
		name: name,
		password: password,
		tmp: true,
	});
	// Player2 Login
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

	// Changer les status des joueurs et recupere leur profil
	const user1 = await fetchChangeStatus(player1, 'in_game');
	const user2 = await fetchChangeStatus(player2, 'in_game');

	// Cree le match en DB et le renvoie
	const match = await insertInTable('matches', player1.id, player1.type, player2.id, 'registered');

	return reply.code(200).send({
		match: match,
		user1: user1,
		user2: user2,
		message: 'Registered match successfully created',
	});

}

// Route POST pour creer un match contre un guest
export async function guestMatch(request, reply) {
	const player1 = request.user;
	const guestID = 0;

	const user = await fetchChangeStatus(player1, 'in_game');

	const match = await insertInTable('matches', player1.id, player1.type, guestID, 'guest');

	return reply.code(200).send({
		match: match,
		user1: user,
		message: 'Guest match successfully created',
	});
}

// Route POST pour creer un match contre IA
export async function iaMatch(request, reply) {
	const player1 = request.user;
	const iaID = -1;

	const user = await fetchChangeStatus(player1, 'in_game');

	const match = await insertInTable('matches', player1.id, player1.type, iaID, 'ia');

	return reply.code(200).send({
		match: match,
		user1: user,
		message: 'IA match successfully created',
	});
}

// Route GET pour recuperer l'historique des matchs d'un joueur par son ID
export async function getHistory(request, reply) {
	const userID = request.params.id; // parser les params ?
	if (userID === undefined)
		return reply.code(400).send({ error: 'No ID in params.' });
	else if (!(/^[0-9]+$/.test(userID)))
		return reply.code(403).send({ error: 'Invalid ID format.' });

	const history = await getHistoryByUserID(userID);
	return reply.code(200).send(history);
}

// Route PUT pour mettre fin au match, update les infos necessaires
export async function finish(request, reply) {
	const match = request.body;
	const { scoreP1, scoreP2, p1_id, p1_type, p2_id, p2_type } = match;
	const winner_id = scoreP1 > scoreP2 ? p1_id : p2_id;
	match.winner_id = winner_id;

	// verifier que le match est bien en cours
	if (await getMatchByID(match.id) === undefined)
		return reply.code(400).send({ error: 'There is no match with this ID.' });

	// mettre le match dans la table history
	const historyMatch = await insertInHistory(match);

	// supprimer le match de la table matches
	await deleteMatch(match.id);

	// mettre a jour les stats et le status des joueurs
	const user = await fetchUpdateStats(p1_id, p1_type, p2_id, p2_type, winner_id);

	// Renvoie le profil du player1 (session user)
	return reply.code(200).send({
		user: user,
		match: historyMatch,
		message: 'Finished match.'
	});
}

// Route GET pour récupérer tous les matches
// route /matches
export async function getAllMatchesController(request, reply) {
	const matches = await getAllMatches();
	return reply.code(200).send({ matches });
}

// Route GET pour récupérer un match par son ID
// route /matches/:id
export async function getMatchById(request, reply) {
	const match = await getMatch(request.params.id);
	return reply.code(200).send({ match });
}

// Route PUT pour mettre à jour le résultat d'un match
// route /matches/:id/result
export async function updateMatchResultController(request, reply) {
	const match = await updateMatchResult(request.params.id, request.body.scoreP1, request.body.scoreP2, request.body.winner_id);
	return reply.code(200).send({ match });
}

