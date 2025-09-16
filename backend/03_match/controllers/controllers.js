//controllers/controllers.js

import { insertInTable } from '../models/models.js';
// import { createLocalMatch, createVsMatch, getAllMatches, getMatch, updateMatchResult } from '../models/models.js';

// Route POST pour créer un match 
// route /matches
export async function createMatch(request, reply) {
	const body = request.body;
	const match_type = body.match_type;
	const player1 = request.user;

	let p2_id;
	if (match_type === 'registered') {
		// authentifier le joueur 2 sans donner de JWT
		// eventuellement 2fa
		// seulement recuperer son id pour le match
		const p2LoginRes = await fetch('http://user-service:3000/login', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				name: body.name,
				password: body.password,
				email: body.email,
				tmp: true,
			}
		});
		if (!p2LoginRes.ok)
			return (p2LoginRes);
		const player2 = p2LoginRes.body.user;
//		match = insertInTable('matches', player1.id, player1.type, player2.id, match_type);
		p2_id = player2.id;

		// Changer le status du player 2
		await fetch('http://user-service:3000/changestatus', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: player2.name,
				id: p2_id,
				status: 'match:' + player1.id,
				type: player2.type,
			}),
		});

	} else {
		// p2_id sera vide -> pas de match history pour P2
		p2_id = 0;
	}
		// Changer le status du player 1
		await fetch('http://user-service:3000/changestatus', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: player1.name,
				id: player1.id,
				status: 'match:' + p2_id,
				type: player1.type,
			}),
		});

		// let match;
		// if (match_type === 'local')
		// 	match = await createLocalMatch(request.user.name, body.player2.name);
		// else if (match_type === 'vs')
		// 	match = await createVsMatch(request.user.name, body.player2.name);
		// else
			// 	return reply.code(400).send({ error: 'Invalid match type' });
		
		// console.log("match ceartion test fonction createMatch :" , match);
	const match = await insertInTable('matches', player1.id, player1.type, p2_id, match_type);
	console.log("MATCH\n", match);
	return reply.code(200).send({
		match,
		message: 'Match successfully created',
	});
	// verifier dans le front si match.match_type == registered
	// si oui : requete a /twofa/verifycode
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

