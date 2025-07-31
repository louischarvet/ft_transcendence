import { createMatch } from '../controllers/controllers.js';
import { matchSchema } from '../schema/matchSchema.js'

export default async function matchRoutes (fastify, opts) {
	// Differents types de matches
//	fastify.put('/random', randomMatch);
//	fastify.put('/vs', vsMatch);
//	fastify.put('/ia', iaMatch);
//	fastify.put('/local', localMatch); // to do
//
//	fastify.patch('/result/:id', updateResult);
//	fastify.get('/:id', getMatchID);
	
	// Route POST pour créer un match
	//fastify.post('/matches', async (request, reply) => {
	//	try {
	//		const { poolId, player1, player2 } = request.body;

	//		if (!poolId || !player1 || !player2)
	//			return reply.code(400).send({ error: 'poolId, player1 et player2 sont requis' });

	//		const match = await addMatch({ poolId, player1, player2 });
	//		return reply.code(201).send(match);
	//	} catch (err) {
	//		console.error('Erreur création match:', err.message);
	//		return reply.code(500).send({ error: err.message });
	//	}
	//});

	// Jouer en local entre 2 joueurs
	// Il faut que le front mette match_type('local') dans le body avant d'envoyer la requete
	fastify.put('/local',{ preHandler: [fastify.authenticate], schema: matchSchema }, createMatch);

	fastify.post('/jwt', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		console.log("\n\n");
		console.log("Request : ", request);
		console.log("\n\n");
		const playerName = request.user.name;
		console.log('match/jwt: ', playerName);
	});

	fastify.post('/toto', async (request, reply) => {
		const body = request.body;
		if (body === undefined) {
			return reply.code(400).send({ error: 'no body' });
		}
		console.log(body);
	//	console.log('name: ', name, ' status: ', status);
		if (body.name === undefined || body.status === undefined) {
			return reply.code(400).send({ error: 'name and status are required' });
		}

	});
	// Route PUT pour creer un match avec un random
	fastify.put('/random', async (request, reply) => {
		// Validation des donnees JSON a faire
		// format attendu: nom du joueur qui cherche
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
	});

	// Route PUT pour match avec un joueur en particulier
	fastify.put('/vs', async (request, reply) => {
		// nom du joueur qui cherche
		const playerName = request.body.name;

		const query = request.query;
		if (!query)
			return { error: 'Name is undefined' };
		const opponentName = query.name;
		if (!opponentName)
			return { error: 'Name is undefined' };

		// Check l'existence du joueur et sa disponibilite
		const opponent = await fetch ('http://user-service:3000/find/' + opponentName, {
			method: 'GET',
		});
		const oppBody = await opponent.json();
//		console.log("////////// vs oppBody: ", oppBody);
		if (oppBody.error) {
			console.log(oppBody.error);
			return (oppBody.error);
		} else if (oppBody.status === 'available') {
			// Envoyer invitation (faire le service !) au joueur trouve
			//	const invitation = await fetch();

			// if invitation accepted
			// envoyer dans le bodynom du joueur + nouvel etat
			const response = await fetch('http://user-service:3000/update', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					player1: playerName,
					player2: opponentName,
					type: 'match'
				})
			});
			createMatch(playerName, opponentName);
			// que faire de la response?
			// Faire les JSON Schemas !!!
			return (response);
		} else {
			return { error: opponentName + ' is not available.' };
		}
	});

	// Route PUT pour match contre l'IA
	fastify.put('/ia', async (request, reply) => {
		const playerName = request.body.name;

		// Mise a jour de la DB user (match:IA)
		// Traite-t-on l'IA comme un joueur dans la DB ?
		const response = await fetch('http://user-service:3001/update', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				player1: playerName,
				player2: p2Name,
				type: 'match'
			})
		})

		// Creation du match dans la db matches
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