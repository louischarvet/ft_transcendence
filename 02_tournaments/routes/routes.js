import { getDataTournaments } from './controllers/tournaments.js';

async function routesPlugin(fastify, options) {
	fastify.get('/data_tournaments', async (request, reply) => {
    	const data = await getDataTournaments();
    	return (data);
	});
}

export default routesPlugin;