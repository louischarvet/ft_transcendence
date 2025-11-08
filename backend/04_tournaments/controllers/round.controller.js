import { 
    fetchMatchForTournament, 
    fetchFinishMatchForTournament, 
    fetchHistoryMatchForTournament, 
    getMatchTournament 
} from './match.controller.js';

import { endTournament } from './tournament.controller.js';

async function validateRequest(matchBody, user, reply) {
	if (!matchBody || !matchBody.tournamentID || matchBody.tournamentID <= 0)
		return reply.code(400).send({ error: 'TournamentId is required' });

	const tournamentId = Number(matchBody.tournamentID);
	const { db } = reply.server;
	const tournamentArr = await db.tournament.get('id', tournamentId);
	const tournament = tournamentArr[0];

	if (!tournament)
		return reply.code(404).send({ error: 'TournamentId not found' });
	if (tournament.status !== 'started')
		return reply.code(400).send({ error: 'Tournament not started or finished' });

	// Vérifier que l'utilisateur fait partie du tournoi
	const toFind = `${user.id}:${user.type};`;
	if (!String(tournament.players || '').includes(toFind))
		return reply.code(403).send({ error: 'User not in tournament' });

	return tournament;
}

async function getCurrentRoundData(tournament, reply) {
	const { db } = reply.server;
	// Récupérer le round courant
	const roundArr = await db.round.get(tournament.id, tournament.rounds);
	const round = roundArr[0];
	if (!round)
		return reply.code(404).send({ error: 'Impossible to get data round' });
	console.log("###\nFonction getCurrentRoundData: round -- >", round, "\n###\n");

	let matchHistory = await fetchHistoryMatchForTournament(tournament.id);
	if (matchHistory.error)
		return reply.code(500).send({ error: 'Could not fetch match history' });
	console.log("###\nFonction getCurrentRoundData : matchHistory --> ", matchHistory, "\n###\n");

	const matchesArray = Array.isArray(matchHistory.tournamentData)
		? matchHistory.tournamentData
		: [];

	return { round, matchesArray };
}

async function checkMatchValidity(round, matchBody, matchesArray, reply) {
	// Vérifier que le match appartient bien au round
	const roundMatchIds = String(round.matchs || '').split(';').filter(Boolean);;
	if (!roundMatchIds.includes(String(matchBody.id)))
		return reply.code(404).send({ error: 'Does not found match in round' });

	// Vérifier si le match est déjà fini dans l'historique
	const currentMatchHistory = matchesArray.find(m => String(m.id) === String(matchBody.id));
	if (currentMatchHistory && currentMatchHistory.winner_id !== null && currentMatchHistory.winner_id !== undefined)
		return reply.code(400).send({ error: 'Match already finish' });

	return roundMatchIds;
}

async function finishMatchAndReload(matchBody, tournament, request, reply) {
	// Récupérer le match complet depuis le service match (si nécessaire)
	const matchFromDbRes = await getMatchTournament(matchBody.id);
	const matchFromDb = matchFromDbRes?.match || {};
	const finishPayload = { ...matchFromDb, scoreP1: matchBody.scoreP1, scoreP2: matchBody.scoreP2 };
	console.log("###\nFonction finishMatchAndReload: matchFromDbRes -->", matchFromDbRes, "\n###\n");
	console.log("###\nFonction finishMatchAndReload: matchFromDb -->", matchFromDb, "\n###\n");
	console.log("###\nFonction finishMatchAndReload: finishPayload -->", finishPayload, "\n###\n");

	// Appeler le finish du match (met à jour l'historique des matchs)
	const finishMatch = await fetchFinishMatchForTournament(finishPayload, request.cookies);
	if (!finishMatch)
		return reply.code(500).send({ error: 'Impossible to finish match' });
	console.log("###\nFonction finishMatchAndReload: finishMatch -->", finishMatch, "\n###\n");

	// Recharger l'historique pour vérifier l'état des matchs du round
	const matchHistory = await fetchHistoryMatchForTournament(tournament.id);
	if (matchHistory.error)
		return reply.code(500).send({ error: 'Could not fetch match history' });

	return matchHistory;
}

async function prepareNextRound(matchesInRound, tournament, reply) {
	// Tous les matchs de ce round sont terminés -> on prépare le prochain round
	// Récupérer les gagnants
	const users = [];
	for (const m of matchesInRound) {
		const winnerId = Number(m.winner_id);
		let winnerType = m.p1_type || m.p2_type || 'guest';
		if (m.p1_id && winnerId === Number(m.p1_id))
			winnerType = m.p1_type;
		else if (m.p2_id && winnerId === Number(m.p2_id))
			winnerType = m.p2_type;
		users.push({ id: winnerId, type: winnerType });
	}

	// Construire les paires du prochain round
	const arrayMatchesNextRound = [];
	for (let i = 0; i < users.length; i += 2) {
		const p1 = users[i];
		const p2 = users[i + 1];
		if (!p1) continue;
		if (!p2) {
			const finalWinnerId = p1.id;
			return { arrayMatchesNextRound: [], finalWinner: finalWinnerId };
		}
		arrayMatchesNextRound.push({
				player1: { id: p1.id, type: p1.type },
				player2: { id: p2.id, type: p2.type },
				tournamentID: tournament.id
			});
	}

	// Si on a une seule paire, le prochain round sera la finale
	return { arrayMatchesNextRound, finalWinner: null };
}

async function updateTournamentAfterRound(tournament, round, arrayMatchesNextRound, reply) {
	const { db } = reply.server;

	// Créer les matchs via match service
	const matchsNextRound = [];
	for (const nextM of arrayMatchesNextRound) {
		const res = await fetchMatchForTournament(nextM);
		if (res.error)
			return reply.code(500).send({ error: 'Could not create matches for tournament' });
		matchsNextRound.push(res.match);
	}

	// Mettre à jour DB : finir le round courant et créer le prochain round
	const nextRound = await db.round.finishRound(tournament.id, round.round);
	const newRoundNumber = nextRound?.round || (round.round + 1);

	// Construire le string des nouveaux matchs
	const matchesString = matchsNextRound.map(m => m.id).join(';');

	// 1) ajouter à l'historique
	await db.history.addMatchesAndPlayers(tournament.id, matchesString, tournament.players);
	// 2) mettre à jour la colonne matchs du tournoi (concaténation)
	const newTournamentMatches = tournament.matchs
		? `${tournament.matchs};${matchesString}`
		: matchesString;
	await db.tournament.setMatches(tournament.id, newTournamentMatches);
	// 3) mettre à jour la table round pour le nouveau round
	await db.round.updateRoundData(tournament.id, newRoundNumber, matchesString, tournament.players);	

	return { matches: matchsNextRound };
}

export async function nextRound(request, reply) {
	const matchBody = request.body || {};
	const user = request.user;
	console.log("###\nFonction nextRound : matchbody --> ", matchBody, "\n###\n");

	// 1 : validation
	const tournament = await validateRequest(matchBody, user, reply);
	if (!tournament) return;
	console.log("###\nFonction nextRound : tournament -->", tournament, "\n###\n");

	// 2 : round + historique
	const { round, matchesArray } = await getCurrentRoundData(tournament, reply);
	if (!round) return;
	console.log("###\nFonction nextRound : matchesArray --> ", matchesArray, "\n###\n");
	console.log("###\nFonction nextRound : round --> ", round, "\n###\n");

	// 3 : Verifie que le match est valide
	const roundMatchIds = await checkMatchValidity(round, matchBody, matchesArray, reply);
	if (!roundMatchIds) return;
	console.log("###\nFonction nextRound : roundMatchIds --> ", roundMatchIds, "\n###\n");

	// 4 : terminer le match et recharger l’historique
	const matchHistory = await finishMatchAndReload(matchBody, tournament, request, reply);
	if (!matchHistory) return;
	console.log("###\nFonction nextRound, matchHistory --> ", matchHistory, "\n###\n");

	// 5 : Verifie si tous les matchs du round sont terminés
	const matchesInRound = (matchHistory.tournamentData || [])
			.filter(m => roundMatchIds.includes(String(m.id)));
	// Si tous les matchs du round ne sont pas terminés -> réponse informative
	if (roundMatchIds.length !== matchesInRound.length) {
		return reply.code(200).send({
			tournament,
			matchFinish: matchHistory,
			matchmessage: 'All matchs round not finished'
		});
	}

	// 5 : Preparer le prochain round
	const { arrayMatchesNextRound, finalWinner } = await prepareNextRound(matchesInRound, tournament, reply);
	console.log("###\nFonction nextRound, arrayMatchesNextRound --> ", arrayMatchesNextRound, "\n###\n");

	if (finalWinner) {
		// Tournoi terminé
		endTournament(tournament.id, reply);
		return reply.code(200).send({ tournament: finishedTournamentArr, message: 'Tournament finished' });
	}

	// 6 : MAJ des DATA history, tournament et round
	const updateResult = await updateTournamentAfterRound(tournament, round, arrayMatchesNextRound, reply);

	return reply.code(200).send({
		matches: updateResult.matches,
		matchFinish: matchHistory,
		message: 'next round'
	});
}

export async function updateMatchAndRemainingPlaces(request, reply) {
	const body = request.body;
	if (!body) return reply.code(400).send({ error: 'Invalid body' });

	const { db } = request.server;
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
	const tournamentArr = await db.tournament.get('id', tournamentId);
	const tournament = tournamentArr[0];
	if (!tournament) return reply.code(404).send({ error: 'Tournament not found' });

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
	if (!playerExists) return reply.code(400).send({ error: 'Player not in tournament' });

	// Vérifier que le match est bien dans tournament
	const matchExists = matchsArray.includes(String(matchId));
	if (!matchExists) return reply.code(400).send({ error: 'Match not in tournament' });

	// 1) terminer le match via match-service si nécessaire
	try {
		let matchFromDb;
		if (typeof getMatchTournament === 'function') {
			const res = await getMatchTournament(matchId);
			matchFromDb = res?.match || { id: matchId, tournament_id: tournamentId };
		} else matchFromDb = { id: matchId, tournament_id: tournamentId };

		const finishPayload = {
			...matchFromDb,
			scoreP1: body.scoreP1 ?? matchFromDb.scoreP1,
			scoreP2: body.scoreP2 ?? matchFromDb.scoreP2
		};

		const finishRes = await fetchFinishMatchForTournament(finishPayload, request.cookies || {});
		if (finishRes?.error) {
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
	const newMatchsStr = newMatchsArray.join(';');

	// 3) mettre à jour la DB via updateMatchAndPlaces
	const updatedTournamentArr = await db.tournament.updateMatchesAndPlaces(tournamentId, newMatchsStr, newPlayersStr);
	const updatedTournament = updatedTournamentArr[0];
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not update match and remaining places' });

	// 4) si tournoi terminé (<=1 joueur restant), set winner
	if (Number(updatedTournament.nbPlayersTotal) <= 1) {
		const remainingPlayers = String(updatedTournament.players || '').split(';').filter(Boolean);
		if (remainingPlayers.length > 0) {
			const first = remainingPlayers[0];
			const winnerId = Number(first.split(':')[0]);
			if (winnerId && winnerId > 0) {
				// terminer le tournoi dans le fichier tournoi.controller.js
				const finalTournamentArr = await endTournament(updatedTournament.id, reply, winnerId);
				return reply.code(200).send({ tournament: finalTournamentArr, message: 'Tournament finished' });
			}
		}
	}

	return reply.code(200).send({ tournament: updatedTournament, message: 'Match and remaining places updated' });
}
