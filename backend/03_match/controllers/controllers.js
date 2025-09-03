//controllers/controllers.js

import { createLocalMatch, createVsMatch, getAllMatches, getMatch, updateMatchResult } from '../models/models.js';

// Route POST pour créer un match 
// route /matches
export async function createMatch(request, reply) {
	const body = request.body;
	const match_type = body.match_type;

	let match;
	if (match_type === 'local')
		match = await createLocalMatch(request.user.name, body.player2.name);
	else if (match_type === 'vs')
		match = await createVsMatch(request.user.name, body.player2.name);
	else
		return reply.code(400).send({ error: 'Invalid match type' });

	console.log("match ceartion test fonction createMatch :" , match);

	return reply.code(200).send({ match });
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

