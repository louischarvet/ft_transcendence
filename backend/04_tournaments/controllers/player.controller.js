// player.controller.js

import { fetchGetUserById, fetchCreateGuest, fetchUserLogin, fetchChangeStatusUser } from './user.controller.js';
import { getTournament, addPlayerToTournament} from '../models/model.js';



export async function addNewPlayerToTournament(db, tournamentId, playerId, playerType){

	// let tournament = db.
	let tournament = await getTournament(tournamentId);
	tournament = await addPlayerToTournament(tournamentId, `${playerId}:${playerType};`);
	return tournament;
}

// rejoindre un tournoi en tant que 
//! pas utilisé en front
export async function joinTournamentSession(request, reply){
	const { tournamentId } = request.body;
	const guest = await fetchCreateGuest();
	if (guest.error)
		return reply.code(500).send({ error: 'Could not create guest' });

	const tournament = await addNewPlayerToTournament(request.server.db, tournamentId, guest.id, guest.type);
	return reply.code(200).send({ tournament, user: guest });
}

export async function joinTournamentRegistered(request, reply){
	const { name, password } = request.body;
	if (!name || !password)
		return reply.code(400).send({ error: 'Name and password are required' });

	// Login du joueur
	const player2 = await fetchUserLogin(name, password);
	if (!player2 || player2.error)
		return reply.code(400).send({ error: 'Login failed' });

	// tournamentId depuis URL
	const tournamentId = Number(request.params.id);
	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send({ error: 'TournamentId is required' });

	// Verifie que le tournoi existe et places dispo
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });
	if (tournament.remainingPlaces < 1)
		return reply.code(400).send({ error: 'Tournament is full or already joined' });

	// Récupère le joueur pour vérifier son statut
	const currentUser = await fetchGetUserById(player2.id);
	if (!currentUser)
		return reply.code(400).send({ error: 'PlayerId does not exist' });
	if (player2.status !== 'available')
		return reply.code(400).send({ error: 'Player unavailable' });

	// Ajoute le joueur au tournoi
	const addPlayer = player2.id.toString() + ':' + currentUser.type + ';';
	await addNewPlayerToTournament(tournamentId, addPlayer);

	// Met à jour le statut du joueur
	await fetchChangeStatusUser(currentUser, "in_game");

	return reply.code(200).send({ user: player2, message: 'Joined tournament' });
}

// rejoindre un tournoi en guest temporaire
export async function joinTournamentGuest(request, reply){

	const tournamentId = request.params.id;
	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send({ error: 'TournamentId is required' });
	
	// creer un guest
	const guest = await fetchCreateGuest();
        if (!guest || guest.error)
            return reply.code(400).send({ error: 'Guest creation failed' });

	// Verifier que tournoi existe et places dispo
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });
	if (tournament.remainingPlaces < 1)
		return reply.code(400).send({ error: 'Tournament is full' });

	// Ajoute le guest au tournoi
	// const addPlayer = guest.id.toString() + ':' + guest.type + ';';
	await addNewPlayerToTournament(tournamentId, guest.id.toString(),  guest.type);
	await fetchChangeStatusUser(guest, "in_game");
	return reply.code(200).send({ user: guest, message: 'Joined tournament' });
}
