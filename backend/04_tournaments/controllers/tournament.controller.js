// tournament.controller.js

import {
	createTournamentRow,
	getTournament,
	getTournamentsWonByUser,
	startTournamentInternal,
	setTournamentWinner,
	addMatchesStringToTournament,
	addMatchesAndPlayersToHistory,
	addDataRoundTable,
	addPlayerToTournament,
	
} from '../models/model.js';

import { addNewPlayerToTournament } from './player.controller.js';
import { fetchUserTournament } from './user.controller.js';
import { fetchMatchForTournament, fetchHistoryMatchForTournament, fetchFinishMatchForTournament } from './match.controller.js';

// Recupere tout les tournoie gagnes par un user
export async function getTournamentWinUserId(request, reply){
	const id = request.params.id;
	const userId = Number(id);
	if (!userId)
		return reply.code(400).send({ error : 'UserId is required' });

	const tournaments = await getTournamentsWonByUser(userId);
	if (!tournaments)
		return reply.code(200).send({ tournaments: [], message: 'No tournament wins' });

	const ids = tournaments.map(({ id }) => id).join(';');
	return reply.code(200).send({ tournaments: ids, message: 'Tournaments winned' });
}

export async function launchTournament(request, reply){
	const user = request.user;
	// if (!user)
	// 	return reply.code(400).send({ error: 'Only logged-in users can create a tournament' });

	const body = request.body;
	// if (!body)
	// 	return reply.code(400).send({ error: 'Invalid body' });
	// const nbPlayers = body.nbPlayers;
	// if (![4,8,16].includes(nbPlayers))
	// 	return reply.code(400).send({ error: 'nbPlayers invalid' });

	const tmpTournament = await createTournamentRow(body.nbPlayers, user.id);
	if (!tmpTournament)
		return reply.code(500).send({ error: 'Could not create tournament' });

	let Tournament = await getTournament(tmpTournament.id);
	Tournament = await addPlayerToTournament(Tournament.id, user.id + ':' + user.type + ';');

	return reply.code(201).send({ Tournament, message: 'Tournament created. Waiting for players.' });
}

export async function endTournament(request, reply){
	const { tournamentId, winnerId } = request.body;
	if (!tournamentId || !winnerId)
		return reply.code(400).send({ error: 'Invalid body' });

	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });

	const updatedTournament = await setTournamentWinner(tournamentId, winnerId);
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not set tournament winner' });

	return reply.code(200).send({ tournament: updatedTournament, message: 'Tournament ended' });
}

export async function startTournament(request, reply){
	const user = request.user;
	const tournamentId = request.params.id;
	let tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });
	if (tournament.status !== 'waiting')
		return reply.code(400).send({ error: 'Tournament already started or finished' });
	if (tournament.creatorId != user.id)
		return reply.code(400).send({ error: 'Only creator of tournament can start tournament' });
	console.log("tournament -> ",tournament);
	// Ajout IA si nécessaire
	let countIa = 0;
	for(; tournament.remainingPlaces > 0;){
		countIa++;
		tournament = await addNewPlayerToTournament(tournamentId, '0', 'ia');
	}
	
	const playersArray = tournament.players.split(';');
	//Data des joueur
	let playersInfos = new Array(playersArray.length - 1 - countIa);

	for (let i = 0, j = 0; i < playersArray.length - 1; i++){
		if (playersArray[i] !== '0:ia'){
			const [id, type] = playersArray[i].toString().split(':');
			//liste d'objet a envoyé au service match apres
			playersInfos[j] = { id: Number(id), type: type};
			j++;
		}
	}

	// Recupere les player d'un tournoi par une liste d'id et de type
	let listPlayers = await fetchUserTournament(playersInfos);
	if (listPlayers.error)
		return reply.code(500).send({ error: 'Could not fetch users for tournament' });

	// Tri par win_rate
	let rankedUsers = [...listPlayers.registered, ...listPlayers.guests].sort((a,b)=>a.win_rate-b.win_rate);

	let finalPlayers = [];
	for (let i=0; i<tournament.nbPlayersTotal; i++){
		if (rankedUsers[i])
			finalPlayers.push(`${rankedUsers[i].id}:${rankedUsers[i].type}:${rankedUsers[i].name}`);
		if (countIa > 0){
			finalPlayers.push('0:ia');
			countIa--;
		}
	}

	console.log("finalPlayers --> ", finalPlayers);
	// Création des matchs
	let matches = [];
	for(let i=0; i<finalPlayers.length; i+=2){
		const [p1Id,p1Type,p1Name] = finalPlayers[i].split(':');
		const [p2Id,p2Type,p2Name] = finalPlayers[i+1].split(':');
		matches.push({ player1:{id:Number(p1Id),type:p1Type, name:p1Name}, player2:{id:Number(p2Id),type:p2Type, name:p2Name}, tournamentID:tournamentId });
	}

	let tournamentMatchData = [];
	for(let m of matches){
		const res = await fetchMatchForTournament(m);
		if(res.error)
			return reply.code(500).send({ error: 'Could not create matches for tournament' });
		tournamentMatchData.push(res.match);
		m.id = res.match.id;
		console.log("Created match for tournament:", m);
	}
	console.log("matches for tournament created:", matches);

	// Mettre à jour l'historique
	let matchesString = tournamentMatchData.map(m => m.id).join(';');
	await addMatchesAndPlayersToHistory(tournamentId, matchesString, tournament.players);
	await addMatchesStringToTournament(tournamentId, matchesString);
	await addDataRoundTable(tournamentId, tournament.rounds, matchesString, tournament.players);
	let updatedTournament = await startTournamentInternal(tournamentId);

	return reply.code(200).send({ tournament: { ...updatedTournament, matches }, message: 'Tournament started' });
}

export async function getTournamentById(request, reply){
	const tournamentId = Number(request.params.id);
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error : 'Tournament not found' });

	return reply.code(200).send({ tournament, message: 'Tournament info' });
}

export async function getAllTournaments(request, reply){
	const db = await getDB();
	const tournaments = await db.all(`SELECT * FROM tournaments`);
	return reply.code(200).send({ tournaments, message: 'All tournaments' });
}
