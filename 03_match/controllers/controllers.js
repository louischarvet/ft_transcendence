//controllers/controllers/js

//import { cre } from '../models/models.js';
//import fetch from 'node-fetch';
import { setMatch } from '../models/models.js'

//Fonction utile
async function createMatch(request, reply) {
	const body = request.body;
	const match_type = body.match_type;

	// Fonction a part ? pour verifier que le type du match correspond a la route
	const url = request.url;
	if (url === '/local' && match_type !== 'local')
		return reply.code(400).send({ error: 'Must be local match_type' });

	const p1Name = (request.user ? request.user.name : 'P1');
	const p2Name = (body.player2 ? body.player2.name : 'P2');
	
	await setMatch(p1Name, p2Name, match_type);
}


//////Route PUT /local
//async function localMatch(request, reply) {
//	await createMatch();
//}


// Route PUT /match/random
async function randomMatch(request, reply) {
	// Validation des donnees JSON a faire
	// format attendu: nom du joueur qui cherche
	const body = request.body;
	if (body === undefined)
		return reply.code(400).send({ error: 'No body in request' });
	const playerName = request.body.name;
	
	// GET random player from user-service
	// le param query name est le nom du joueur qui cherche
	const opponent = await fetch('http://user-service:3000/random?name=' + playerName, {
		method: 'GET',
	});
	// recuperer le json de la reponse (fetch)
	const oppBody = await opponent.json();
//	if (oppBody === undefined) { // aucun joueur trouve
	if (oppBody.error) {
		console.log('///match/random: undefined');
		console.log(oppBody.error); //
		return (oppBody.error);
	} else {
		// Envoyer invitation (faire le service !) au joueur trouve
		//	const invitation = await fetch();
		const p2Name = oppBody.name;
		// Mise a jour des etats des joueurs dans user-service (PUT)
		const response = await fetch('http://user-service:3000/update', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				player1: playerName,
				player2: p2Name,
				type: 'match'
			})
		})
		// Creation du match dans la db matches
		createMatch(playerName, p2Name); //
		// return JSON: ID du match, player1, player2 ? (db)
		return (response);
		// si erreur (player1 ou player2 non available) retourner erreur
	}
}

// Fonction utilitaire pour vérifier si un joueur existe dans user-service
//  APIT REST ?
async function userExists(username) {
	const res = await fetch(`http://user-service:3000/exists?name=${username}`);
	return res.ok;
}

// Fonction pour ajouter un match
async function addMatch(match) {
	try {
		const { poolId, player1, player2 } = match;

		// test si les deux joueurs existent 
		const [exists1, exists2] = await Promise.all([
			userExists(player1),
			userExists(player2)
		]);

		if (!exists1 || !exists2)
			throw new Error('Un ou plusieurs joueurs sont inconnus.');

		// creer match
		return await createMatch(poolId, player1, player2);
	} catch (error) {
		throw new Error('Error creating match: ' + error.message);
	}
}

export { addMatch , createMatch };
