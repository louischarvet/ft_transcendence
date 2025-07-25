import { checkUserExists, createUser, fetchUserByName, fetchUsers,
	fetchUserStatus, getRandomUser, changeState }
	from '../controllers/user.js';

// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});
	fastify.get('/users', fetchUsers);
	fastify.get('/exists', checkUserExists);	
	fastify.get('/users/:name', fetchUserByName);
	fastify.get('/users/:name/status', fetchUserStatus);
	fastify.post('/users', createUser);

	fastify.get('/random', getRandomUser);
	fastify.put('/match', changeState);
}

export default userRoutes;
