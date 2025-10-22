import { launchTournament, getTournamentWinUserId, joinTournamentSession, joinTournamentRegistered, joinTournamentGuest, endTournament, startTournament, getTournamentById, getAllTournaments, updateMatchAndRemainingPlaces, nextRound } from '../controllers/tournaments.js';
import { authenticateJWT } from '../authentication/auth.js';
import { tournamentSchema } from '../schema/tournamentSchema.js';
import { loginInput } from '../schema/userInput.js';


export default async function routesPlugin(fastify, options) {
	fastify.get('/', async (request, reply) => {
		return { hello: 'from tournament' };
	});

	//! ajout le 19/19/2025
	//route pour recuperer les tournois(pour participer aux tournois)
	fastify.get('/winnertournament/:id', /*shcema de tournoi a determiner*/ getTournamentWinUserId);

	//! ajout le 19/09/2025
	// Si un joueur veux creer un tournois(remplie automatiquement avec ia, attente de 2 min pour qu'un autre user se connecte au tournoie)
	 fastify.post('/launchtournament',{preHandler: authenticateJWT , schema: tournamentSchema }, launchTournament);

	//! ajout le 22/09/2025
	fastify.post('/jointournamentsession/:id', { preHandler: authenticateJWT }, joinTournamentSession);
	fastify.post('/jointournamentregistered/:id', { preHandler: authenticateJWT, schema: loginInput }, joinTournamentRegistered);
	fastify.post('/jointournamentguest/:id', { preHandler: authenticateJWT }, joinTournamentGuest);

	fastify.post('/endtournament', { preHandler: authenticateJWT }, endTournament);
	fastify.post('/starttournament/:id', { preHandler: authenticateJWT }, startTournament);
	fastify.get('/:id', getTournamentById);
	fastify.get('/all', getAllTournaments);

	//! ajout le 30/09/2025
	// route PUT pour generer les matchs du prochain round, et MAJ les data de tournoi
	fastify.put('/next', { preHandler: authenticateJWT }, nextRound);

	//! ajout le 22/09/2025
	//pour louis
	fastify.put('/updateMatchAndPlaces', { preHandler: authenticateJWT }, updateMatchAndRemainingPlaces);

}
