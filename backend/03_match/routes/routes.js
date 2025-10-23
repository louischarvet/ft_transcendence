import { registeredMatch, guestMatch, iaMatch, getHistory, finish, tournamentMatch, getAllMatchesController, getMatch, updateMatchResultController , getHistoryByTournamentID} from '../controllers/controllers.js';
import { registeredMatchSchema, matchSchema, tournamentMatchSchema } from '../schema/matchSchema.js'
import { authenticateJWT } from '../authentication/auth.js';
import { isAvailable } from '../common_tools/isAvailable.js';
import { unalteredMatch } from '../common_tools/unalteredMatch.js';

export default async function matchRoutes(fastify, opts) {
	// Route test
	fastify.get('/', async (request, reply) => {
		reply.send({ message : 'Hello from match service' });
	});
	
	// CRUD des matches (creation, lecture, MAJ et suppresion des matches)

	// Route POST pour créer un match -> diviser en 3
//	fastify.post('/match', { preHandler: authenticateJWT, schema: matchSchema }, createMatch);

	// Route POST pour jouer contre un joueur inscrit
	fastify.post('/registered', { preHandler: [ authenticateJWT, isAvailable ], schema: registeredMatchSchema }, registeredMatch);

	// Route POST pour jouer contre un guest
	fastify.post('/guest', { preHandler: [ authenticateJWT, isAvailable ] }, guestMatch);

	// Route POST pour jouer contre une IA
	fastify.post('/ia', { preHandler: [ authenticateJWT, isAvailable ] }, iaMatch);

	// Route GET pour recuperer l'historique des matchs d'un joueur (par ID)
	fastify.get('/history/:id', { preHandler: authenticateJWT }, getHistory);
	
	//!ajout le 29/09/2025
	// Route GET pour recuperer l'historique des matchs d'un tournoi (par ID)
	fastify.get('/history/tournament/:id', getHistoryByTournamentID);
	
	// Route GET pour récupérer un match par id
	//! important ;-)
	fastify.get('/tournament/match/:id', { preHandler: [ authenticateJWT ] }, getMatch);

	// Route PUT pour mettre fin au match, update les infos necessaires
	fastify.put('/finish', { preHandler: [ authenticateJWT/*, unalteredMatch */], schema: matchSchema }, finish);

	// Route POST pour creer un match avec IDs des joueurs deja definis (via tournament)	
	fastify.post('/tournament', { schema: tournamentMatchSchema }, tournamentMatch);

}
