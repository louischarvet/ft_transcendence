import {
  createTournamentRow,
  getTournament,
  addPlayerToTournament,
  getTournamentsWonByUser,
  startTournamentInternal,
  setTournamentWinner,
  updateMatchAndPlaces
} from '../models/model.js';
//import fetch from 'node-fetch';


//// //! ajout 19/09/2025
 export async function fetchGetUserById(id){

 	const user = await fetch(`http://user-service:3000/${id}`, {
		method: 'GET'
	});
 	if(!user.ok)
 		return ({ error : 'User not found'});

 	const currentUser = await user.json();
	return (currentUser.user);
 };

//! ajout 24/09/2025
export async function fetchGetGuestById(id){

	const user = await fetch(`http://user-service:3000/getguest/${id}`, {
		method: 'GET'
	});
 	if(!user.ok)
 		return ({ error : 'User not found'});

 	const currentUser = await user.json();
	return (currentUser.user);
};

//! ajout 24/09/2025
export async function fetchChangeStatusUser(user){
	const res = await fetch(`http://user-service:3000/changestatus`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user)
	});
	if(!res.ok)
		return ({ error : 'User not found'});

	const updatedUser = await res.json();
	return (updatedUser.user);
};

//! ajout 24/09/2025
export async function fetchUserLogin(name, password){
	const res = await fetch(`http://user-service:3000/login`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, password, tmp: true })
	});
	if(!res.ok)
		return ({ error : 'Login failed'});

	const loggedUser = await res.json();
	return (loggedUser.user);
}

//!ajout 24/09/2025
export async function fetchCreateGuest(){
	const res = await fetch(`http://user-service:3000/guest`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ tmp: true })
	});
	if(!res.ok)
		return ({ error : 'Login failed'});

	const guestUser = await res.json();
	return (guestUser.user);
}

//! ajout 19/09/2025
//Recupere tout les tournoie gagne par un user
export async function getTournamentWinUserId(request, reply){

	console.log("###### function getTournamentWinUserId()\n");

	const id = request.params.id;
	console.log("Parametre -> ", request.params.id, "\n");
	const userId = Number(id);
	console.log("userId -> ", userId, "\n");
	if (!userId)
		return reply.code(400).send( { error : 'UserId is required'});
	
	// ON recupere tout les tournoies gqgner par un idUser
	const tournaments = await getTournamentsWonByUser(userId);
	console.log("tournoi gagne par l'userId :", userId," --> ", tournaments, "########\n");

	if (tournaments === undefined){
		return reply.code(200).send({
			tournaments: [],
			message: 'No tournament wins'
		});
	}
	// On doit stocker la liste des tournoi gagne par l'user dans une chaine "1;3;6..." pour userId1 par exemple

	//list des ids tounois gagnes correspondant a luserID
	const ids = tournaments.map(({ id }) => id);

	const tournamentWinned = ids.join(';');

	console.log("######\n");
	return reply.code(200).send({
		tournaments: tournamentWinned,
		message: 'Tournaments winned'
	});
};

//! ajout le 22/09/2025
async function addNewPlayerToTournament(tournamentId, playerId, playerType) {
	const Tournament = await getTournament(tournamentId);
	if (!Tournament)
		return null;
	if (Tournament.remainingPlaces <= 0){
		console.log("Tournament full");
		// ca bloque la suite a voir si throw new Error('Tournament full');
		return null;
	}

	// je sais pas si c'est utile
	if (playerId == -1 && playerType !== 'ia')
		return null;
	if (playerType === 'ia'){
		if (playerId !== -1)
			return null;
		return await addPlayerToTournament(tournamentId, -1, 'ia');
	}

	const tmpPlayers = Tournament.players;
	const currentPlayers = playerId + ';';
	const newPlayers = tmpPlayers ? tmpPlayers + currentPlayers : currentPlayers;

	// parser newPlayers pour savoir si le joueur est deja dans le tournoi
	const playersArray = newPlayers.split(';').filter(p => p);
	if (playersArray.includes(playerId.toString()))
		return Tournament; // joueur deja dans le tournoi
	
	return await addPlayerToTournament(tournamentId, playerId, 'user');
}

//! ajout 19/09/2025
export async function launchTournament(request, reply) {
	const user = request.user;
	if (!user)
		return reply.code(403).send({ error: 'Only logged-in users can create a tournament' });

	const body = request.body;
	if (!body)
		return reply.code(400).send({ error: 'Invalid body' });
	const nbPlayers = body.nbPlayers;
	if (!nbPlayers || typeof nbPlayers !== 'number' || nbPlayers != 4 && nbPlayers != 8 && nbPlayers != 16)
		return reply.code(400).send({ error: 'nbPlayers invalid' });
	
	const creatorId = user.id;
	if (!creatorId || creatorId <= 0)
		return reply.code(400).send({ error: 'creatorId is required' });

	const tournament = await createTournamentRow(nbPlayers, creatorId);
	if (!tournament)
		return reply.code(500).send({ error: 'Could not create tournament' });


	const type = user.type;
	if (!type)
		return reply.code(400).send({ error: 'Type is required' });

	let tmpTournament = await getTournament(tournament.id);
	if (!tmpTournament)
		return reply.code(404).send({ error: 'Tournament not found after creation' });
	tmpTournament = await addPlayerToTournament(tmpTournament.id, creatorId.toString() + ':' + type.toString() + ';');

	//// pour lancer le timer avec de remplir avec les bots
	//const TWO_MINUTES_TIMEOUT = 2 * 60 * 1000;
	//setTimeout(async () => {
	//	const tmpTournament = await getTournament(tournament.id);
	//	if (!tmpTournament || tmpTournament.status !== 'waiting')
	//		return;

	//	if (tmpTournament.remainingPlaces > 0) {
	//		for (let i = 0; i < tmpTournament.remainingPlaces; i++)
	//			await addPlayerToTournament(tmpTournament.id, -1, 'ia');
	//	}
	//	//! faudrais ici remplir les match avec matchservice ???
	//	await startTournamentInternal(tmpTournament.id);
	//}, TWO_MINUTES_TIMEOUT );
	
	return reply.code(201).send({ tmpTournament, message: 'Tournament created. Waiting for players.' });
};

//! ajout le 22/09/2025
// Route POST: un user log (autre navigateur) veux rejoindre un tournoi deja créé
export async function joinTournamentSession(request, reply){
	const tournamentId = Number(request.params.id);
	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send( { error : 'TournamentId is required'});
	
	const user = request.user;
	if (!user)
		return reply.code(403).send({ error: 'Only logged-in users can join a tournament' });
	
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send( { error : 'Tournament not found'});
	if (tournament.status !== 'waiting')
		return reply.code(400).send( { error : 'Tournament already started'});

	const playerId = user.id;
	if (!playerId || playerId <= 0)
		return reply.code(400).send( { error : 'PlayerId is required'});

	if (tournament.remainingPlaces < 1)
		return reply.code(400).send( { error : 'Could not join tournament (full or already joined)'});

	const currentUser = await fetchGetUserById(playerId);
	if (!currentUser)
		return reply.code(400).send( { error : 'PlayerId does not exist'});
	
	console.log("#####currentUser : ", currentUser);
	if (currentUser.status !== 'available')
		return reply.code(400).send( { error : 'player unavailble'});

	const addPlayer = playerId.toString() + ':' + currentUser.type + ';';
	let updatedTournament = await addNewPlayerToTournament(tournamentId, addPlayer);

	//TODO 23/09/2025 fetchChangeStatuUser ===> ingame
	await fetchChangeStatusUser(currentUser);

	if (updatedTournament.remainingPlaces  === 0)
		updatedTournament = await startTournamentInternal(updatedTournament.id);

	return reply.code(200).send({ tournament: updatedTournament, message: 'Joined tournament' });
};

//TODO 24/09/2025
// Route POST: un user se log sur une meme session pour rejoindre le tournoi
export async function joinTournamentRegistered(request, reply){
	const { name, password } = request.body;

	// Login du player2+
	const player2 = await fetchUserLogin(name, password);
	console.log("#####player2 : ", player2);
	if (player2.error)
		return reply.code(400).send( { error : 'Login failed'});

	// same
	const tournamentId = Number(request.params.id);
	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send( { error : 'TournamentId is required'});
	
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send( { error : 'Tournament not found'});
	if (tournament.status !== 'waiting')
		return reply.code(400).send( { error : 'Tournament already started'});

		if (tournament.remainingPlaces < 1)
		return reply.code(400).send( { error : 'Could not join tournament (full or already joined)'});

	const currentUser = await fetchGetUserById(player2.id);
	if (!currentUser)
		return reply.code(400).send( { error : 'PlayerId does not exist'});
	
//	console.log("#####currentUser : ", currentUser);
	if (currentUser.status !== 'available')
		return reply.code(400).send( { error : 'player unavailble'});

	const addPlayer = player2.id.toString() + ':' + currentUser.type + ';';
	let updatedTournament = await addNewPlayerToTournament(tournamentId, addPlayer);

	await fetchChangeStatusUser(currentUser);

	if (updatedTournament.remainingPlaces  === 0)
		updatedTournament = await startTournamentInternal(updatedTournament.id);

	return reply.code(200).send({ tournament: updatedTournament, message: 'Joined tournament' });
	
}

// Route POST: un guest rejoint le tournoi (creer le guest)
export async function joinTournamentGuest(request, reply){
		// Login du player2+
	const player2 = await fetchCreateGuest();
	if (player2.error)
		return reply.code(400).send( { error : 'Login failed'});

	// same
	const tournamentId = Number(request.params.id);
	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send( { error : 'TournamentId is required'});
	
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send( { error : 'Tournament not found'});
	if (tournament.status !== 'waiting')
		return reply.code(400).send( { error : 'Tournament already started'});

	if (tournament.remainingPlaces < 1)
		return reply.code(400).send( { error : 'Could not join tournament (full or already joined)'});

	// fetch guest by Id
	const currentUser = await fetchGetGuestById(player2.id);
	if (!currentUser)
		return reply.code(400).send( { error : 'PlayerId does not exist'});
	
	console.log("#####currentUser : ", currentUser);
	if (currentUser.status !== 'available')
		return reply.code(400).send( { error : 'player unavailble'});

	const addPlayer = player2.id.toString() + ':' + currentUser.type + ';';
	let updatedTournament = await addNewPlayerToTournament(tournamentId, addPlayer);

	await fetchChangeStatusUser(currentUser);

	if (updatedTournament.remainingPlaces  === 0)
		updatedTournament = await startTournamentInternal(updatedTournament.id);

	return reply.code(200).send({ tournament: updatedTournament, message: 'Joined tournament' });
	
}

//! ajout 22/09/2025
export async function endTournament(request, reply) {
	const body = request.body;
	if (!body)
		return reply.code(400).send({ error: 'Invalid body' });
	const tournamentId = body.tournamentId;
	if (!tournamentId || typeof tournamentId !== 'number' || tournamentId <= 0)
		return reply.code(400).send({ error: 'tournamentId invalid' });
	const winnerId = body.winnerId;
	if (!winnerId || typeof winnerId !== 'number' || winnerId < -1)
		return reply.code(400).send({ error: 'winnerId invalid' });

	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });
	if (tournament.status !== 'started')
		return reply.code(400).send({ error: 'Tournament not started or already finished' });

	const updatedTournament = await setTournamentWinner(tournamentId, winnerId);
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not set tournament winner' });

	return reply.code(200).send({ tournament: updatedTournament, message: 'Tournament ended' });
};

//! ajout 22/09/2025
export async function startTournament(request, reply) {
	// fetch create tournament matches
	const user = request.user;
	const tournamentId = request.params.id;
	if ( !tournamentId || tournamentId <= 0 )
		return reply.code(400).send({ error: 'tournamentId invalid' });
	
	const tournament = await getTournament(tournamentId);
	console.log("###########tournament\n", tournament ,"#############\n");
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });
	if (tournament.status !== 'waiting')
		return reply.code(400).send({ error: 'Tournament already started or finished' });
	if (tournament.creatorId != user.id)
		return reply.code(400).send({ error: 'Only creator of tournament can start tournament' });
	// si remaining place > 0
	//replir avec ia
	if (tournament.remainingPlaces > 0){
		for(; tournament.remainingPlaces > 0; tournament.remainingPlaces--)
			await addNewPlayerToTournament(tournamentId, '0:ia;');
	}
	const updatedTournament = await startTournamentInternal(tournamentId);
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not start tournament' });

	// fetch User: recuperer les stats de tous les joueurs
	// tableau d'objet user
	const stringPlayers = updatedTournament.players;
	const playersArray = stringPlayers.split(';').filter(p => p);
	//creation d'un tableau d'objet {id: number, type: string, rank: number, winRate: number};
	console.log("###########playersArray\n", playersArray ,"#############\n");

	// Les guest prioritaire pour se battre contre les ia
	//sinon rank le plus faible contre ia en priorite


	// dans user: au prealable calculer win rate des joueurs (victoires / matchs joues)
	// faire ici un classement des joueurs selon leurs win rates
	// joueurs les plus nazes jouent contre l'I.A.?
	// requete a match pour set tous les matchs et les recuperer
	//! 23/09/2025 ajout ia pour remplir les places restantes
	return reply.code(200).send({ tournament: updatedTournament, message: 'Tournament started' });
}

//! ajout 22/09/2025
export async function getTournamentById(request, reply){

	const id = request.params.id;
	const tournamentId = Number(id);
	if (!tournamentId || tournamentId <= 0)
		return reply.code(400).send( { error : 'TournamentId is required'});
	
	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send( { error : 'Tournament not found'});

	return reply.code(200).send({
		tournament: tournament,
		message: 'Tournament info'
	});
};

export async function nextRound(request, reply){

	const user = request.user;
	const tournamentId = request.params.id;
	if ( !tournamentId || tournamentId <= 0 )
		return reply.code(400).send({ error: 'tournamentId invalid' });

	const currentTournament = await getTournament(tournamentId);
	if (!currentTournament)
		return reply.code(400).send({ error: 'tournamentId invalid' });

	if (user.id != currentTournament.creatorId)
		return reply.code(400).send({ error: 'Only creator can authenticate nextRound' });

	// set les prochains match
	//update les match 
	
};

//!ajout 22/09/2025
export async function updateMatchAndRemainingPlaces(request, reply){

	const body = request.body;
	if (!body)
		return reply.code(400).send({ error: 'Invalid body' });

	const tournamentId = body.tournamentId;
	if (!tournamentId || typeof tournamentId !== 'number' || tournamentId <= 0)
		return reply.code(400).send({ error: 'tournamentId invalid' });

	const matchId = body.matchId;
	if (!matchId || typeof matchId !== 'number' || matchId <= 0)
		return reply.code(400).send({ error: 'matchId invalid' });

	const playerId = body.playerId;
	if (!playerId || typeof playerId !== 'number' || playerId <= 0)
		return reply.code(400).send({ error: 'playerId invalid' });

	const tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });

	const players = tournament.players;
	if (!players || players.split(';').length <= 1)
		return reply.code(400).send({ error: 'Not enough players in tournament' });

	const newPlayers = players.erase(playerId.toString());
	if (newPlayers === players)
		return reply.code(400).send({ error: 'Player not in tournament' });

	const nbPlayersTotal = tournament.nbPlayersTotal;
	if (nbPlayersTotal <= 1)
		return reply.code(400).send({ error: 'Tournament already finished' });

	const newMatches = players.erase(matchId.toString());
	if (newMatches === players)
		return reply.code(400).send({ error: 'Match not in tournament' });

	// Mettre a jour le matchId avec le playerId et les remainingPlaces
	const updatedTournament = await updateMatchAndPlaces(tournamentId, newMatches, newPlayers);
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not update match and remaining places' });

	if (updatedTournament.nbPlayersTotal <= 1) {
		const winnerId = Number(updatedTournament.players.split(';')[0]);
		if (winnerId && winnerId > 0) {
			const finalTournament = await setTournamentWinner(tournamentId, winnerId);
			if (finalTournament)
				return reply.code(200).send({ tournament: finalTournament, message: 'Tournament finished' });
		}
	}

	return reply.code(200).send({ tournament: updatedTournament, message: 'Match and remaining places updated' });
};

//! ajout 22/09/2025
export async function getAllTournaments(request, reply){

	const db = await getDB();
	const tournaments = await db.all(`SELECT * FROM tournaments`);

	return reply.code(200).send({
		tournaments: tournaments,
		message: 'All tournaments'
	});
};
