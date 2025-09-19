import { launchTournament, getTournamentUserId/*,  getNextMatch */} from '../controllers/tournaments.js';
import { authenticateJWT } from '../authentication/auth.js';
import { tournamentSchema } from '../schema/tournamentSchema.js';


export default async function routesPlugin(fastify, options) {
	fastify.get('/', async (request, reply) => {
		return { hello: 'from tournament' };
	});

	//! ajout le 19/19/2025
	//route pour recuperer les tournois(pour participer aux tournois)
	fastify.get('/winnerTournament/:id', /*shcema de tournoi a determiner*/ getTournamentUserId);

	//! ajout le 19/09/2025
	// Si un joueur veux creer un tournois(remplie automatiquement avec ia, attente de 2 min pour qu'un autre user se connecte au tournoie)
	// fastify.post('/launchTournament',{preHandler: authenticateJWT , schema: tournamentSchema }, launchTournament);


}
