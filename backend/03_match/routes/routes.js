import { createMatch, getAllMatchesController, getMatchById, updateMatchResultController } from '../controllers/controllers.js';
import { matchSchema, matchUpdateSchema, userSchema } from '../schema/matchSchema.js'


export default async function matchRoutes(fastify, opts) {
	// Route test
	fastify.get('/', async (request, reply) => {
		reply.send({ message : 'Hello from match service' });
	});
	
	// CRUD des matches (creation, lecture, MAJ et suppresion des matches)

	// Route POST pour créer un match
	fastify.post('/matches', { preHandler: [fastify.authentication], schema: matchSchema }, createMatch);

	// Route GET pour récupérer tous les matches
	fastify.get('/matches', { preHandler: [fastify.authentication] }, getAllMatchesController);

	// Route GET pour récupérer un match par son ID
	fastify.get('/matches/:id', { preHandler: [fastify.authentication] }, getMatchById);

	// Route PUT pour mettre à jour le résultat d'un match
	fastify.put('/matches/:id/result', { preHandler: [fastify.authentication], schema: matchUpdateSchema }, updateMatchResultController);

	// Route par types de match :
	// Route PUT pour créer un match local
	fastify.put('/local', { preHandler: [fastify.authentication], schema: userSchema }, createMatch);

	// Route PUT pour créer un match vs meme schema que pour createMatch
	fastify.put('/vs', { preHandler: [fastify.authentication] }, createMatch);

	// Route de test JWT
	fastify.post('/jwt', { preHandler: [fastify.authentication] }, async (request, reply) => {
		const playerName = request.user.name;
		reply.send({ message: `Hello ${playerName}`, user: request.user });
	});

}
