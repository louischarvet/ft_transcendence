import { createGuest, register, logIn, logOut, deleteUser, fetchUserStatus,
	updateAvatar, updateInfo, addFriend, changeStatus, updateStats,
	fetchUserByIdToken,fetchUserById, getGuestById, getFriendsProfiles, fetchUserTournament }
	from '../controllers/controllers.js';
import { registerInput, loginInput, updateSchema, guestTmp , deleteSchema} from '../schema/userInput.js';
import { userSchema, updateStatsSchema } from '../schema/userSchema.js';
import { authenticateJWT } from '../authentication/auth.js';

// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});

	// prevalider les tokens JWT ici ?

	// Renvoie un userSchema
	fastify.post('/guest', { schema: guestTmp }, createGuest);
	fastify.post('/register', { schema: registerInput }, register);
	fastify.put('/login', { schema: loginInput }, logIn);

	fastify.put('/update',{ preHandler: authenticateJWT , schema: updateSchema },  updateInfo);
	fastify.put('/updateAvatar',{ preHandler: authenticateJWT },  updateAvatar);


	//! ajout le 17/09/2025
	// pour recuperer un user par son id (via son token)
	fastify.get('/id', { preHandler: authenticateJWT }, fetchUserByIdToken);
	fastify.get('/:id', fetchUserById);

	//! ajout le 17/09/2025
	//! supprimer les schemas userSchema
	fastify.put('/logout', {preHandler: authenticateJWT },  logOut);
	fastify.delete('/delete',{preHandler: authenticateJWT , schema: deleteSchema },  deleteUser);

	//! ajout le 17/09/2025
	//! supprimer les schemas userSchema
	fastify.post('/addfriend/:friendName', {preHandler: authenticateJWT},  addFriend);
	fastify.get('/getfriendsprofiles', { preHandler: authenticateJWT }, getFriendsProfiles);

	fastify.get('/getguest/:id', getGuestById);

	// dans quels cas sont utilisees ces deux routes ?
	// fetchUserByName et fetchUserStatus seront utilisees dans la route /vs
	// + retirer le /users ici, car l'url finale ressemble a ca sinon:
	// http://localhost:3000/user/users/:name (c'est redondant)
	// remplacer par search ou fetch ?
	//fastify.get('/find/:name', fetchUserByName);

	fastify.get('/find/:name/status', fetchUserStatus);

	//! ajout le 25/09/2025
	// a voir pour schema route tournament
	// faut t il mettre un prehandler ?
	fastify.post('/tournament', fetchUserTournament);


	// Dédié aux autres dockers 
//	fastify.get('/random', {preHandler : [fastify.authentication]}, getRandomUser);
//	fastify.get('/vs', checkAvailability)

	// Utilisee par le service 2fa, probablement par match ou game plus tard
	// Routes a proteger !
	fastify.put('/changestatus',{schema: userSchema }, changeStatus);
	fastify.put('/updatestats', { schema: updateStatsSchema }, updateStats);
}

export default userRoutes;

