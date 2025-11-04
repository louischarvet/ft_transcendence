// round.controller.js

import {
	getTournament,
	getRoundTable,
	updateMatchAndPlaces,
	addMatchesAndPlayersToHistory,
	finishRound,
	setMatchesForTournament,
	updateRoundData
} from '../models/model.js';

import { fetchMatchForTournament , fetchFinishMatchForTournament, fetchHistoryMatchForTournament, getMatchTournament } from './match.controller.js';

export async function nextRound(request, reply) {
	const matchBody = request.body || {};
	const user = request.user;

	console.log("matchbody -> ", matchBody);
	// Validation basic
	if (!matchBody || !matchBody.tournamentID || matchBody.tournamentID <= 0)
		return reply.code(400).send({ error: 'TournamentId is required' });
	const tournamentId = Number(matchBody.tournamentID);
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'TournamentId not found' });
	if (tournament.status !== 'started')
		return reply.code(400).send({ error: 'Tournament not started or finished' });


	// Vérifier que l'utilisateur fait partie du tournoi
	const toFind = `${user.id}:${user.type};`;
	if (!String(tournament.players || '').includes(toFind))
		return reply.code(403).send({ error: 'User not in tournament' });

	console.log("tournament:", tournament);
	// Récupérer le round courant
	const round = await getRoundTable(tournament.id, tournament.rounds);
	if (!round)
		return reply.code(404).send({ error: 'Impossible to get data round' });

	console.log("round:", round);

	/***********************/
	/******** MATCH ********/
	/***********************/	

	// Récupérer l'historique des matchs du tournoi
	let matchHistory = await fetchHistoryMatchForTournament(tournament.id);
	if (matchHistory.error)
		return reply.code(500).send({ error: 'Could not fetch match history' });
	const matchesArray = Array.isArray(matchHistory.tournamentData) ? matchHistory.tournamentData : [];


	console.log("###\nFonction nextRound : matchHistory --> ", matchHistory, "\n###\n");
	console.log("###\nFonction nextRound : matchesArray --> ", matchesArray, "\n###\n");
	console.log("###\nFonction nextRound : round --> ", round, "\n###\n");
	// Vérifier que le match appartient bien au round
	//const roundMatchIds = String(round.matchs || '').split(';').filter(Boolean);
	const roundMatchIds = String(round.matchs || '').split(';').filter(Boolean);;
	if (!roundMatchIds.includes(String(matchBody.id)))
		return reply.code(404).send({ error: 'Does not found match in round' });


	// Vérifier si le match est déjà fini dans l'historique
	const currentMatchHistory = matchesArray.find(m => String(m.id) === String(matchBody.id));
	if (currentMatchHistory && currentMatchHistory.winner_id !== null && currentMatchHistory.winner_id !== undefined)
		return reply.code(400).send({ error: 'Match already finish' });


	// Récupérer le match complet depuis le service match (si nécessaire)
	const matchFromDbRes = await getMatchTournament(matchBody.id);
	console.log("matchFromDbRes:", matchFromDbRes);
	const matchFromDb = matchFromDbRes?.match || {};
	const finishPayload = { ...matchFromDb, scoreP1: matchBody.scoreP1, scoreP2: matchBody.scoreP2 };


	// Appeler le finish du match (met à jour l'historique des matchs)
	const finishMatch = await fetchFinishMatchForTournament(finishPayload, request.cookies);
	if (!finishMatch)
		return reply.code(500).send({ error: 'Impossible to finish match' });


	// Recharger l'historique pour vérifier l'état des matchs du round
	matchHistory = await fetchHistoryMatchForTournament(tournament.id);
	if (matchHistory.error)
		return reply.code(500).send({ error: 'Could not fetch match history' });
	const matchesInRound = (matchHistory.tournamentData || []).filter(m => roundMatchIds.includes(String(m.id)));


	// Si tous les matchs du round ne sont pas terminés -> réponse informative
	const unfinished = matchesInRound.find(m => m.winner_id === null || m.winner_id === undefined);
	if (unfinished) {
		return reply.code(200).send({
			tournament,
			matchFinish: matchHistory,
			matchmessage: 'All matchs round not finished'
		});
	}


	// Tous les matchs de ce round sont terminés -> on prépare le prochain round
	// Récupérer les gagnants
	const users = [];
	for (const m of matchesInRound) {
		const winnerId = Number(m.winner_id);
		let winnerType = m.p1_type || m.p2_type || 'guest';
		if (m.p1_id && winnerId === Number(m.p1_id))
			winnerType = m.p1_type;
		else if (m.p2_id && winnerId === Number(m.p2_id)) winnerType = m.p2_type;
			users.push({ id: winnerId, type: winnerType });
	}


	// Construire les paires du prochain round
	const arrayMatchesNextRound = [];
	for (let i = 0; i < users.length; i += 2) {
		const p1 = users[i];
		const p2 = users[i + 1];
		if (!p1) continue;
		if (!p2) {
			// Cas où il n'y a qu'un gagnant -> tournoi fini
			const finalWinnerId = p1.id;
			const finishedTournament = await setTournamentWinner(tournament.id, finalWinnerId);
			return reply.code(200).send({ tournament: finishedTournament, message: 'Tournament finished' });
		}
		arrayMatchesNextRound.push({
				player1: { id: Number(p1.id), type: p1.type },
				player2: { id: Number(p2.id), type: p2.type },
				tournamentID: tournament.id
			});
	}


	console.log("arrayMatchesNextRound",arrayMatchesNextRound);
	// Créer les matchs via match service
	const matchsNextRound = [];
	for (const nextM of arrayMatchesNextRound) {
		const res = await fetchMatchForTournament(nextM);
		if (res.error)
			return reply.code(500).send({ error: 'Could not create matches for tournament' });
			matchsNextRound.push(res.match);
	}


	// Mettre à jour DB : finir le round courant et créer le prochain round (finishRound crée aussi la nouvelle entrée de round)
	const nextRound = await finishRound(tournament.id, round.round);
	const newRoundNumber = nextRound?.round || (round.round + 1);


	// Construire le string des nouveaux matchs
	const matchesString = matchsNextRound.map(m => m.id).join(';');


	// 1) ajouter à l'historique
	await addMatchesAndPlayersToHistory(tournament.id, matchesString, tournament.players);
	// 2) mettre à jour la colonne matchs du tournoi (on concatène)
	const newTournamentMatches = tournament.matchs ? `${tournament.matchs};${matchesString}` : matchesString;
	await setMatchesForTournament(tournament.id, newTournamentMatches);
	// 3) mettre à jour la table round pour le nouveau round
	await updateRoundData(tournament.id, newRoundNumber, matchesString, tournament.players);

	return reply.code(200).send({ matches: matchsNextRound, matchFinish: matchHistory, message: 'next round' });
}

export async function updateMatchAndRemainingPlaces(request, reply) {
	const body = request.body;
	if (!body)
		return reply.code(400).send({ error: 'Invalid body' });

	const tournamentId = Number(body.tournamentId);
	const matchId = Number(body.matchId);
	const playerId = Number(body.playerId);

	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send({ error: 'tournamentId invalid' });
	if (!matchId || matchId <= 0)
		return reply.code(400).send({ error: 'matchId invalid' });
	if (!playerId || playerId <= 0)
		return reply.code(400).send({ error: 'playerId invalid' });

	// Récupérer le tournoi
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });

	// players existants
	const playersStr = String(tournament.players || '');
	const playersArray = playersStr.split(';').filter(Boolean);
	if (playersArray.length <= 1)
		return reply.code(400).send({ error: 'Not enough players in tournament' });

	// matchs existants
	const matchsStr = String(tournament.matchs || '');
	const matchsArray = matchsStr.split(';').filter(Boolean);

	// Vérifier que le player est bien dans tournament
	const playerExists = playersArray.some(p => String(p).split(':')[0] === String(playerId));
	if (!playerExists)
		return reply.code(400).send({ error: 'Player not in tournament' });

	// Vérifier que le match est bien dans tournament
	const matchExists = matchsArray.includes(String(matchId));
	if (!matchExists)
		return reply.code(400).send({ error: 'Match not in tournament' });

	// 1) terminer le match via match-service si nécessaire
	try {
		// Récupérer les détails du match depuis le match-service si possible
		let matchFromDb;
		if (typeof getMatchTournament === 'function') {
			const res = await getMatchTournament(matchId);
			matchFromDb = res?.match || { id: matchId, tournament_id: tournamentId };
		} else 
			matchFromDb = { id: matchId, tournament_id: tournamentId };

		// Si l'appel fournit un score dans le body (optionnel), on l'ajoute
		const finishPayload = {
			...matchFromDb,
			scoreP1: body.scoreP1 ?? matchFromDb.scoreP1,
			scoreP2: body.scoreP2 ?? matchFromDb.scoreP2
		};

		const finishRes = await fetchFinishMatchForTournament(finishPayload, request.cookies || {});
		if (finishRes?.error) {
			// Ne pas bloquer toute la fonction si le match était déjà fini — log puis erreur
			console.error('fetchFinishMatchForTournament failed:', finishRes);
			return reply.code(500).send({ error: 'Could not finish match' });
		}
	} catch (err) {
		console.error('Error while finishing match:', err);
		return reply.code(500).send({ error: 'Error finishing match' });
	}

	// 2) construire les nouvelles strings players et matchs (on enlève playerId et matchId)
	const newPlayersArray = playersArray.filter(p => String(p).split(':')[0] !== String(playerId));
	const newPlayersStr = newPlayersArray.length ? newPlayersArray.join(';') + ';' : '';

	const newMatchsArray = matchsArray.filter(m => String(m) !== String(matchId));
	const newMatchsStr = newMatchsArray.join(';'); // pas de trailing ; nécessaire pour matchs

	// 3) mettre à jour la DB via updateMatchAndPlaces
	const updatedTournament = await updateMatchAndPlaces(tournamentId, newMatchsStr, newPlayersStr);
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not update match and remaining places' });

	// 4) si tournoi terminé (<=1 joueur restant), set winner
	if (Number(updatedTournament.nbPlayersTotal) <= 1) {
		// récupérer premier joueur dans la string players
		const remainingPlayers = String(updatedTournament.players || '').split(';').filter(Boolean);
		if (remainingPlayers.length > 0) {
			// format attendu: "<id>:<type>:<name>" ou "<id>:<type>"
			const first = remainingPlayers[0];
			const winnerId = Number(first.split(':')[0]);
			if (winnerId && winnerId > 0) {
				const finalTournament = await setTournamentWinner(tournamentId, winnerId);
				if (finalTournament)
					return reply.code(200).send({ tournament: finalTournament, message: 'Tournament finished' });
			}
		}
	}

	return reply.code(200).send({ tournament: updatedTournament, message: 'Match and remaining places updated' });
}
