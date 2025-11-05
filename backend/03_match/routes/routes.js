import { registeredMatch, guestMatch, iaMatch, getHistory, finish, abort, tournamentMatch, getMatchById, 
//	getAllMatchesController, getMatchById, updateMatchResultController,
	getHistoryByTournamentID} from '../controllers/controllers.js';
import { registeredMatchSchema, matchSchema, abortSchema, tournamentMatchSchema } from '../schema/matchSchema.js'
import { authenticateJWT } from '../authentication/auth.js';
//import { isAvailable } from '../common_tools/isAvailable.js';

export default async function matchRoutes(fastify, opts) {
	fastify.post('/registered', { preHandler: [ authenticateJWT/*, isAvailable */], schema: registeredMatchSchema }, registeredMatch);
	fastify.post('/guest', { preHandler: [ authenticateJWT/*, isAvailable */] }, guestMatch);
	fastify.post('/ia', { preHandler: [ authenticateJWT/*, isAvailable */] }, iaMatch);
	fastify.post('/tournament', { schema: tournamentMatchSchema }, tournamentMatch);

	fastify.get('/history/:id', { preHandler: authenticateJWT }, getHistory);
	fastify.get('/history/tournament/:id', getHistoryByTournamentID);
	
	fastify.put('/finish', { preHandler: authenticateJWT, schema: matchSchema }, finish);
	
	fastify.post('/abort', { schema: abortSchema }, abort);





	// ?

	// // Route GET pour récupérer tous les matches
	// fastify.get('/matches', { preHandler: authenticateJWT }, getAllMatchesController);

	// Route GET pour récupérer un match par son ID
	fastify.get('/:id', getMatchById);

	// // Route PUT pour mettre à jour le résultat d'un match
	// fastify.put('/:id/result', { preHandler: authenticateJWT, schema: matchSchema }, updateMatchResultController);
}
