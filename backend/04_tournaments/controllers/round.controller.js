// round.controller.js

import {
	getTournament,
	getRoundTable,
	updateMatchAndPlaces
} from '../models/model.js';

import { fetchFinishMatchForTournament } from './match.controller.js';

export async function nextRound(request, reply){
	const { tournamentID } = request.body;
	const tournament = await getTournament(tournamentID);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });

	const roundData = await getRoundTable(tournamentID, tournament.rounds);
	return reply.code(200).send({ roundData });
}

export async function updateMatchAndRemainingPlaces(request, reply){
	const { match, cookies } = request.body;
	const finishedMatch = await fetchFinishMatchForTournament(match, cookies);
	if(finishedMatch.error)
		return reply.code(500).send({ error: 'Could not finish match' });

	const updatedTournament = await updateMatchAndPlaces(match.tournamentID, match.id);
	return reply.code(200).send({ tournament: updatedTournament });
}
