import { getDataTournaments } from './controllers/tournaments.js';
import { getNextMatch } from './controllers/tournaments.js';

async function routesPlugin(fastify, options) {
	fastify.get('/data_tournaments', async (request, reply) => {
    	const data = await getDataTournaments();
    	return (data);
	});
}

fastify.get('/next_match', async (request, reply) => {
	const match = getNextMatch();
	if (match)
		return match;
	else
	return { message: "Plus de matchs à jouer pour le moment." };
});

export default routesPlugin;