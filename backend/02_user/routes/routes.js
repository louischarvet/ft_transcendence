import { createGuest, signIn, logIn, logOut, deleteUser,
	fetchUserByName, fetchUserStatus, getRandomUser, changeStatus }
	from '../controllers/controllers.js';
import { userInput } from '../schema/userInput.js';
import { userSchema } from '../schema/userSchema.js';


// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});

	// Renvoie un userSchema
	fastify.post('/guest', createGuest);
	fastify.post('/signin', { schema: userInput }, signIn);
	fastify.put('/login', { schema: userInput }, logIn);

	fastify.put('/logout', { schema: userSchema }, logOut);
	fastify.delete('/delete', { schema: userSchema }, deleteUser);

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
	fastify.get('/random', {preHandler : [fastify.authentication]}, getRandomUser);
//	fastify.put('/update',{preHandler : [fastify.authentication], schema  : userSchema}, changeStatus);
//	fastify.get('/vs', checkAvailability)
}

export default userRoutes;
