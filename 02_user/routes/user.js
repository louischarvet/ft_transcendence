import { checkUserExists, sayHello, createUser, fetchUserByName, fetchUsers, fetchUserStatus } from '../controllers/user.js';

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
}

export default userRoutes;
