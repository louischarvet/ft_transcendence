import { createUser, fetchUserByName,
	fetchUserStatus, getRandomUser, changeState }
	from '../controllers/controllers.js';

// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});
	
	// Route pour creer un nouvel utilisateur
	fastify.post('/register', createUser);

	// dans quels cas sont utilisees ces deux routes ?
	// fetchUserByName et fetchUserStatus seront utilisees dans la route /vs
	// + retirer le /users ici, car l'url finale ressemble a ca sinon:
	// http://localhost:3000/user/users/:name (c'est redondant)
	// remplacer par search ou fetch ?
	fastify.get('/find/:name', fetchUserByName);

	fastify.get('/find/:name/status', fetchUserStatus);


	// Dédié aux autres dockers 
	fastify.get('/random', getRandomUser);
	fastify.put('/update', changeState);
//	fastify.get('/vs', checkAvailability)
}

export default userRoutes;
