import {
  createTournamentRow,
  getTournament,
  addPlayerToTournament,
  getTournamentsWonByUser,
  startTournamentInternal,
  setTournamentWinner,
  updateMatchAndPlaces,
  addMatchesStringToTournament,
  addMatchesAndPlayersToHistory,
  addDataRoundTable,
  getRoundTable
} from '../models/model.js';

//! ajout le 25/09/2025
export async function fetchUserTournament(ArrayIdAndType){
	const res = await fetch(`http://user-service:3000/tournament`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ArrayIdAndType })
	});

	//console.log("####Function fetchUserTournament called:\n");
	//console.log("res -> ", res, " \n");
	if(!res.ok)
		return ({ error : 'Users not found'});

	const users = await res.json();
	const usersInfos = JSON.parse(users.users);

	return (usersInfos);
}

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

//! ajout le 26/09/2025
export async function fetchMatchForTournament(matchData){
	const res = await fetch(`http://match-service:3000/tournament`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(matchData)
	});
	if(!res.ok)
		return ({ error : 'Match creation failed'});

	const match = await res.json();
	return (match);
}

//! ajout le 29/09/2025
export async function fetchHistoryMatchForTournament(tournamentId){
	const res = await fetch(`http://match-service:3000/history/tournament/${tournamentId}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});
	if(!res.ok)
		return ({ error : 'Match history retrieval failed'});

	const matchHistory = await res.json();
	return (matchHistory);
}

//! ajout le 30/09/2025
export async function fetchFinishMatchForTournament(match, token){

	const res = await fetch('http://match-service:3000/finish', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `${token}` 
		},
		body: JSON.stringify(match)
	});
	if(!res.ok)
		return ({ error : 'Match creation failed'});

	const matchFinish = await res.json();
	return (matchFinish);
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

	//if (updatedTournament.remainingPlaces  === 0)
	//	updatedTournament = await startTournamentInternal(updatedTournament.id);

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
	//if (tournament.status !== 'waiting')
	//	return reply.code(400).send( { error : 'Tournament already started'});

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

	//if (updatedTournament.remainingPlaces  === 0)
	//	updatedTournament = await startTournamentInternal(updatedTournament.id);

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
	//if (tournament.status !== 'waiting')
	//	return reply.code(400).send( { error : 'Tournament already started'});

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

	//await fetchChangeStatusUser(currentUser);

	//if (updatedTournament.remainingPlaces  === 0)
	//	updatedTournament = await startTournamentInternal(updatedTournament.id);

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

	const user = request.user;
	/***********************/
	/***** TEST TOURNOI *****/
	/***********************/
	/* test la validité du tournoi et la que l'user est bien le createur du tournoi */

	const tournamentId = request.params.id;
	if ( !tournamentId || tournamentId <= 0 )
		return reply.code(400).send({ error: 'tournamentId invalid' });
	
	let tournament = await getTournament(tournamentId);
	if (!tournament)
		return reply.code(404).send({ error: 'Tournament not found' });
	if (tournament.status !== 'waiting')
		return reply.code(400).send({ error: 'Tournament already started or finished' });
	if (tournament.creatorId != user.id)
		return reply.code(400).send({ error: 'Only creator of tournament can start tournament' });

	// on verifie les place restantent
	for(; tournament.remainingPlaces > 0; tournament.remainingPlaces--)
		tournament = await addNewPlayerToTournament(tournamentId, '0:ia;');

	console.log("###\nFonction startTournament : Valeur du tournoi récupéré --> ", tournament, "\n###\n");

	/***********************************************************/
	/**** creation des objets user a envoyer a USER SERVICE ****/
	/***********************************************************/

	//liste des joueur du tournoie (format -> '1:registered;  0:ia;   ....)
	const stringPlayers = tournament.players;
	if (stringPlayers === undefined)
		return reply.code(500).send({ error: 'Impossible to get list of players tournament' });
	const playersArray = stringPlayers.split(';');

	let countIa = 0;
	for (let i = 0; i < playersArray.length - 1; i++){
		if(playersArray[i] === '0:ia')
			countIa++;
	}

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
	//console.log("playersInfos -> ", playersInfos, " \n");

	let listPlayers = await fetchUserTournament(playersInfos);
	console.log("###\nFonction startTournament : liste des objets user(guest et registered) recupéré depuis service user --> ", listPlayers, "\n###\n");
	if (listPlayers.error)	
		return reply.code(500).send({ error: 'Could not fetch users for tournament' });

	// trier les joueurs par win rate
	let rankedUsers = listPlayers.registered.sort((a, b) => a.win_rate - b.win_rate);
	
	//ici a correspond au joueur le plus faible et b le plus fort
	rankedUsers = rankedUsers.concat(listPlayers.guests.sort((a, b) => a.win_rate - b.win_rate));
	
	// il est trié par win_rate croissant
	rankedUsers = rankedUsers.sort((a, b) => a.win_rate - b.win_rate);
	console.log("###\nFonction startTournament : liste des objets user trié pas rank", rankedUsers, "\n###\n");

	let finalPlayers = new Array();
	if (countIa > 0){
		//on va ajouter les ia apres chaques joueur en partant du plus faible
		for (let i = 0; i < rankedUsers.length; i++){
			finalPlayers.push(rankedUsers[i].id.toString() + ':' + rankedUsers[i].type.toString());
			if (countIa >= 0 ){
				const { id, type } = { id: 0, type: 'ia' };
				finalPlayers.push(id.toString() + ':' + type.toString());
				countIa--;
			}
		}
	}
	else{
		//on va ajouter les joueurs (guest et registered) en partant du plus faible
		for (let i = 0; i < rankedUsers.length; i++)
			finalPlayers.push(rankedUsers[i].id.toString() + ':' + rankedUsers[i].type.toString());
	}

	// complete d'ia si nbre ia > nbUsers
	for (let i = 0; i < countIa; i++){
		const { id, type } = { id: 0, type: 'ia' };
		finalPlayers.push(id.toString() + ':' + type.toString());
	}
	console.log("###\nFonction startTournament : liste finalPlayers avec les ia si besoin --> ", finalPlayers, "\n###\n");


	/**************************************************************/
	/**** creation des objets match a envoyer a MATCH SERVICE ****/
	/*************************************************************/

	//!regler avec 2 guest et un user login et lancer tournoi
	//Data des matchs
	const matches = new Array();
	for(let i = 0; i < finalPlayers.length; i+=2){
		const [p1Id, p1Type] = finalPlayers[i].split(':');
		const [p2Id, p2Type] = finalPlayers[i + 1].split(':');
		matches.push({
			player1: { id: Number(p1Id), type: p1Type },
			player2: { id: Number(p2Id), type: p2Type },
			tournamentID: tournamentId
		});
	};

	console.log("###\nFonction startTournament : -> liste d'objet match a envoyé au SERVICE MATCH", matches, "\n###\n");

	// fetch matchservice pour recupérer les matchs initialisé depuis le MATCH SERVICE 
	let tournamentMatchData = new Array();
	for (let i = 0; i < matches.length; i++){
		const res = await fetchMatchForTournament(matches[i]);
		if (res.error)
			return reply.code(500).send({ error: 'Could not create matches for tournament' });
		tournamentMatchData.push(res.match);
	}

	//chaine string match a ajouter a la db tournament et tournament history
	let matchesString = '';
	for (let i = 0; i < tournamentMatchData.length; i++){
		const match = tournamentMatchData[i];
		matchesString += (match.id + ';');
	}

	//AJOUT matches(string) et players(string) a DB HISTORY TOURNOI
	const updateHistoryTournament = await addMatchesAndPlayersToHistory(tournamentId, matchesString, tournament.players);
	if (!updateHistoryTournament)
		return reply.code(500).send({ error: 'Could not update history for tournament' });
	
	//AJOUT match(string) a DB TOURNOI
	const addMatchToTournament = await addMatchesStringToTournament(tournamentId, matchesString);
	if (!addMatchToTournament)
		return reply.code(500).send({ error: 'Could not update matches for tournament' });
	
	//AJOUT match(string) et players(string) a DB ROUND
	let addRoundTable = await addDataRoundTable(tournamentId, tournament.rounds, matchesString, tournament.players);
	if (!addRoundTable)
		return reply.code(500).send({ error: 'Impossible to add Data into round table' });
	
	//INITIALISE tournoi a 'started'
	let updatedTournament = await startTournamentInternal(tournamentId);
	if (!updatedTournament)
		return reply.code(500).send({ error: 'Could not start tournament' });

	console.log("###\nFonction startTournament : -> INFOS TOURNOI ", updatedTournament, "\n###\n");
	return reply.code(200).send({ tournament: tournamentMatchData, message: 'Tournament started' });
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

//!modification 01/10/2025
export async function nextRound(request, reply){

	const { match } = request.body;
	const user = request.user;

	console.log("###\nFonction nextRound : -> match dans le body ", match, "\n###\n");

	/***********************/
	/***** TEST TOURNOI *****/
	/***********************/
	if (!match.tournament_id || match.tournament_id <= 0)
		return reply.code(400).send( { error : 'TournamentId is required'});

	const tournament = await getTournament(match.tournament_id);
	if (!tournament)
		return reply.code(404).send( { error : 'TournamentId not found'});
	if (tournament.status !== 'started')
		return reply.code(404).send( { error : 'Tournament not started or finished'});
	
	if (match.tournament_id !== tournament.id)
		return reply.code(404).send( { error : 'tournament id does not match'});
	
	console.log("###\nFonction nextRound : -> infos tournoi -->", tournament, "\n###\n");

	// verifier si l'user(tofind) fait bien partit du round string(players)
	const toFind = user.id + ':' + user.type + ';';
	if (!tournament.players.toString().includes(toFind))
		return reply.code(404).send( { error: 'User not in tournament'});

	/***********************/
	/***** LOGIQUES .. *****/
	/***********************/

	//recupere la DB ROUND
	let round = await getRoundTable(tournament.id, tournament.rounds);
	console.log("###\nFonction nextRound : -> DB ROUND -->", round, "\n###\n");

	if (round === undefined)
		return reply.code(404).send( { error : 'Impossible to get data round'});

	/***********************/
	/******** MATCH ********/
	/***********************/

	// GET recupérer l'historique des match du tournoiID
	let matchHistory = await fetchHistoryMatchForTournament(match.tournament_id);
	if (matchHistory.error)
		return reply.code(500).send({ error: 'Could not fetch match history' });
	console.log("###\nFonction nextRound : matchHistory --> ", matchHistory, "\n###\n");

	//tableau des matchs deja fini 
	const matchesArray = matchHistory.tournamentData || [];
	if (!Array.isArray(matchesArray))
  		return reply.code(500).send({ error: 'Invalid match history format: tournamentData is not an array' });
	console.log("###\nFonction nextRound : matchesArray --> ", matchesArray, "\n###\n");

	if (matchesArray.length > 0){
		// si le match a finir est dans l'historique
		const currentMatch = matchesArray.find(element => element.id === match.id);
		if (currentMatch && currentMatch.winner_id >= 0)
			return reply.code(404).send({ error: `Match already finish` });
		console.log("###\nFonction nextRound : currentMatch pour savoir si le match a deja ete joué--> ", currentMatch, "\n###\n");
	}

	// verifier si le match est dans le round
	const roundMatchString = round.matchs.split(';').filter(Boolean);
	console.log("###\nFonction nextRound : roundMatchString --> ", roundMatchString, "\n###\n");
	if (!roundMatchString.includes(match.id.toString()))
		return reply.code(404).send( { error : 'Does not found match in round'});

	// PUT mettre a jour la DB history MATCH . on fini le match(recu dans la request)
	const finishMatch = await fetchFinishMatchForTournament(match, request.headers.authorization);
	if (!finishMatch)
		return reply.code(500).send( { error: 'Impossible to finish match'});
	console.log("###\nFonction nextRound : finishMatch (return la db history match a jour)--> ", finishMatch, "\n###\n");

	/***********************/
	/******** ROUND ********/
	/***********************/

	// liste d'IDs (strings) pour les compter apres et les comparer aux match finis
	const roundMatchIds = round.matchs.split(';').filter(Boolean);
	console.log("###\nFonction nextRound : roundMatchIds --->",roundMatchIds, "\n###\n");
	
	// recupere l'historique des match
	matchHistory = await fetchHistoryMatchForTournament(match.tournament_id);
	if (matchHistory.error)
		return reply.code(500).send({ error: 'Could not fetch match history' });

	// filtrer uniquement les matchs dont l'id est dans la liste
	const matchesInRound = matchHistory.tournamentData.filter(m =>
		roundMatchIds.includes(String(m.id)) // on cast en string pour comparer
	);
	console.log("###\nFonction nextRound : matchHistory --->",matchHistory, "\n###\n");
	console.log("###\nFonction nextRound : len:roundMatchIds len:matchHistory --->",roundMatchIds.length , matchesInRound.length, "\n###\n");

	//if (tournament.rounds === 1){
	//	if ( matchHistory.length !== 2 && matchHistory.length !== 4 && matchHistory.length !== 8)
	//		return reply.code(500).send({ error: 'Nbr of matches ended invalid ' });
	//	tournament.rounds += 1;
	//}
	//else if (tournament.rounds === 2 ){
	//	if ( matchHistory.length !== 4 && matchHistory.length !== 6 && matchHistory.length !== 12)
	//		return reply.code(500).send({ error: 'Nbr of matches ended invalid ' });
	//	tournament.rounds += 1;
	//}
	//else if (tournament.rounds === 3){
	//	if ( matchHistory.length !== 8 && matchHistory.length !== 14 )
	//		return reply.code(500).send({ error: 'Nbr of matches ended invalid ' });
	//	tournament.rounds += 1;
	//}
	//else if (tournament.rounds === 4){
	//	if ( matchHistory.length !== 16 )
	//		return reply.code(500).send({ error: 'Nbr of matches ended invalid ' });
	//	// finish tournament
	//}
	//else if (tournament.rounds > 4 && tournament.rounds <= 0)
	//		return reply.code(500).send({ error: 'Nbr of round invalid ' });
	
	//// verifie si tout les matches sont fini
	//for (let i = 0; i < matchHistory.history.length; i++){
	//	if (!matchHistory.history[i].winnerId)
	//		return reply.code(400).send( { error : "One match has no winner "});
	//}

	
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
