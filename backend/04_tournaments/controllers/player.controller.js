// player.controller.js

import { fetchGetUserById, fetchCreateGuest, fetchGetGuestById } from './user.controller.js';
import { getTournament, addPlayerToTournament } from '../models/model.js';


async function addNewPlayerToTournament(tournamentId, playerId, playerType){
	let tournament = await getTournament(tournamentId);
	tournament = await addPlayerToTournament(tournamentId, `${playerId}:${playerType};`);
	return tournament;
}

// rejoindre un tournoi en tant que 
export async function joinTournamentSession(request, reply){
	const { tournamentId } = request.body;
	const guest = await fetchCreateGuest();
	if (guest.error)
		return reply.code(500).send({ error: 'Could not create guest' });

	const tournament = await addNewPlayerToTournament(tournamentId, guest.id, guest.type);
	return reply.code(200).send({ tournament, user: guest });
}

export async function joinTournamentRegistered(request, reply){
	const { tournamentId, userId } = request.body;
	const user = await fetchGetUserById(userId);
	if (user.error)
		return reply.code(500).send({ error: 'User not found' });

	const tournament = await addNewPlayerToTournament(tournamentId, user.id, user.type);
	return reply.code(200).send({ tournament, user });
}

export async function joinTournamentGuest(request, reply){
	const { tournamentId, guestId } = request.body;
	const guest = await fetchGetGuestById(guestId);
	if (guest.error)
		return reply.code(500).send({ error: 'Guest not found' });

	const tournament = await addNewPlayerToTournament(tournamentId, guest.id, guest.type);
	return reply.code(200).send({ tournament, user: guest });
}
