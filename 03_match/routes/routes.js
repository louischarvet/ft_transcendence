import { addMatch, getNextMatch } from '../controllers/match.js';

export default async function routes(fastify, options) {
  	// Route pour ajouter un nouveau match
	fastify.post('/new_match', async (request, reply) => {
	try {
		const match = request.body;
		// Valide les données d'entrée ici si nécessaire
		const result = await addMatch(match);
		reply.send(result);
	} catch (error) {
		fastify.log.error(error);
		reply.status(500).send({ error: 'Internal Server Error' });
	}
  	});

  	// Route pour obtenir le prochain match
	fastify.get('/next_match', async (request, reply) => {
	try {
		const nextMatch = await getNextMatch();
		if (nextMatch) {
		reply.send(nextMatch);
		} else {
		reply.status(404).send({ error: 'No matches found' });
		}
	} catch (error) {
		fastify.log.error(error);
		reply.status(500).send({ error: 'Internal Server Error' });
	}
	});
}
