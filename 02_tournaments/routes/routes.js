import { getDataTournaments, getNextMatch } from '../controllers/tournaments.js';

export default async function routesPlugin(fastify, options) {
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
}