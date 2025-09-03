import { getDataTournaments, getNextMatch } from '../controllers/tournaments.js';

export default async function routesPlugin(fastify, options) {
	fastify.get('/', async (request, reply) => {
		return { hello: 'from tournament' };
	})
	fastify.get('/data_tournaments', async (request, reply) => {
		const data = await getDataTournaments(request, reply);
		reply.send(data);
	});

	fastify.get('/next_match', async (request, reply) => {
		const match = await getNextMatch();
		if (match)
			reply.send(match);
		else
			reply.send({ message: "Plus de matchs à jouer pour le moment." });
	});

	//fastify.get('/prout', async (request, reply) => {
	////	const data = await getDataTournaments(request, reply);
	//	const response = await fetch('http://match-service:3002/prout', {
	//		method: 'POST',
	//		headers: { 'Content-Type': 'application/json' },
	//		body: JSON.stringify({
	//		player1: 1,
	//		player2: 2,
	//		mode: 'pool'
	//	})
	//});
	//	reply.send(response);
	//});
}
