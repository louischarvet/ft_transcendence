import { createGuest, signIn, logIn, logOut, deleteUser,
	fetchUserStatus, updateAvatar, updateInfo,
	addFriend, changeStatus, fetchUserByIdToken , fetchUserById} from '../controllers/controllers.js';
import { userInput, updateSchema } from '../schema/userInput.js';
import { userSchema } from '../schema/userSchema.js';
import { authenticateJWT } from '../authentication/auth.js';

// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});

	// prevalider les tokens JWT ici ?

	// Renvoie un userSchema
	fastify.post('/guest', createGuest);
	fastify.post('/signin', { schema: userInput }, signIn);
	fastify.put('/login', { schema: userInput }, logIn);

	fastify.put('/update',{preHandler: authenticateJWT , schema: updateSchema },  updateInfo);
	fastify.put('/updateAvatar',{preHandler: authenticateJWT},  updateAvatar);


	//! ajout le 17/09/2025
	// pour recuperer un user par son id (via son token)
	fastify.get('/id', { preHandler: authenticateJWT }, fetchUserByIdToken);
	fastify.get('/:id', fetchUserById);

	//! ajout le 17/09/2025
	//! supprimer les schemas userSchema
	fastify.put('/logout', {preHandler: authenticateJWT },  logOut);
	fastify.delete('/delete', {schema: updateSchema },  deleteUser);

	//! ajout le 17/09/2025
	//! supprimer les schemas userSchema
	fastify.post('/addfriend/:friendName', {preHandler: authenticateJWT},  addFriend);

	// dans quels cas sont utilisees ces deux routes ?
	// fetchUserByName et fetchUserStatus seront utilisees dans la route /vs
	// + retirer le /users ici, car l'url finale ressemble a ca sinon:
	// http://localhost:3000/user/users/:name (c'est redondant)
	// remplacer par search ou fetch ?
	//fastify.get('/find/:name', fetchUserByName);

	fastify.get('/find/:name/status', fetchUserStatus);


	// Dédié aux autres dockers 
//	fastify.get('/random', {preHandler : [fastify.authentication]}, getRandomUser);
//	fastify.get('/vs', checkAvailability)

	// Utilisee par le service 2fa, probablement par match ou game plus tard
	// Route a proteger !
	fastify.put('/changestatus',{schema: userSchema }, changeStatus);
}

export default userRoutes;

