import { createGuest, register, logIn, logOut, deleteUser,
	fetchUserByName, fetchUserStatus, updateAvatar, updateInfo,
	addFriend, changeStatus } from '../controllers/controllers.js';
import { registerInput, loginInput, updateSchema } from '../schema/userInput.js';
import { userSchema, updateStatsSchema } from '../schema/userSchema.js';
import { authenticateJWT } from '../authentication/auth.js';

// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});

	// prevalider les tokens JWT ici ?

	// Renvoie un userSchema
	fastify.post('/guest', createGuest);
	fastify.post('/register', { schema: registerInput }, register);
	fastify.put('/login', { schema: loginInput }, logIn);

	fastify.put('/update',{ preHandler: authenticateJWT , schema: updateSchema },  updateInfo);
	fastify.put('/updateAvatar',{ preHandler: authenticateJWT },  updateAvatar);

	fastify.put('/logout', { preHandler: authenticateJWT },  logOut);
	fastify.delete('/delete', { preHandler: authenticateJWT },  deleteUser);

	// Autre service
	fastify.post('/addfriend/:friendName', {preHandler: authenticateJWT , schema: userSchema },  addFriend);

	// Route pour creer un nouvel utilisateur
//	fastify.post('/register', {schema  : userSchema}, createUser);

	// dans quels cas sont utilisees ces deux routes ?
	// fetchUserByName et fetchUserStatus seront utilisees dans la route /vs
	// + retirer le /users ici, car l'url finale ressemble a ca sinon:
	// http://localhost:3000/user/users/:name (c'est redondant)
	// remplacer par search ou fetch ?
	fastify.get('/find/:name', fetchUserByName);

	fastify.get('/find/:name/status', fetchUserStatus);


	// Dédié aux autres dockers 
//	fastify.get('/random', {preHandler : [fastify.authentication]}, getRandomUser);
//	fastify.get('/vs', checkAvailability)

	// Utilisee par le service 2fa, probablement par match ou game plus tard
	// Route a proteger !
	fastify.put('/changestatus',{schema: userSchema }, changeStatus);
	fastify.put('/updatestats', { schema: updateStatsSchema }, updateStats);
}

export default userRoutes;
