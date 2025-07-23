import { addMatch } from '../controllers/match.js';

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

	// Route GET pour tester 
	fastify.get('/prout', async (request, reply) => {
		return { status: 'ok' };
	});
}
