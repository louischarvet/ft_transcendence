import { addMatch } from '../controllers/match.js';
import { createMatch } from '../database/db.js'

export default async function (fastify, opts) {
	// Route POST pour créer un match
	fastify.post('/matches', async (request, reply) => {
		try {
			const { poolId, player1, player2 } = request.body;

			if (!poolId || !player1 || !player2)
				return reply.code(400).send({ error: 'poolId, player1 et player2 sont requis' });

			const match = await addMatch({ poolId, player1, player2 });
			return reply.code(201).send(match);
		} catch (err) {
			console.error('Erreur création match:', err.message);
			return reply.code(500).send({ error: err.message });
		}
	});

	// Route PUT pour creer un match avec un random
	fastify.put('/random', async (request, reply) => {
		// Validation des donnees JSON a faire
		// format attendu: nom du joueur qui cherche
		const playerName = request.body.name;
		
		// GET random player from user-service
		const opponent = await fetch('http://user-service:3001/random?name=' + playerName, {
			method: 'GET',
		});

		// recuperer le json de la reponse (fetch)
		const oppBody = await opponent.json();

		if (oppBody === undefined) { // aucun joueur trouve
			console.log('///match/random: undefined');
			console.log(oppBody.error); //
			return (oppBody.error);
		} else {
			// Envoyer invitation (faire le service !) au joueur trouve
			//	const invitation = await fetch();

			const p2Name = oppBody.name;
			// Mise a jour des etats des joueurs dans user-service (PUT)
			const response = await fetch('http://user-service:3001/match', {
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
	});

	// Route GET pour tester 
	fastify.get('/prout', async (request, reply) => {
		return { status: 'ok' };
	});
}

// const response = await fetch('http://match-service:3002/prout', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     player1: 1,
//     player2: 2,
//     mode: 'pool'
//   })
// });