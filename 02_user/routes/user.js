import { checkUserExists, createUser, fetchUserByName, fetchUsers,
	fetchUserStatus, getRandomUser, changeState }
	from '../controllers/user.js';

// On définit les routes pour l'API user
async function userRoutes(fastify, options) {
	fastify.get('/', (request, reply) => {
		reply.send({ message: 'Hello from user' });
	});
	fastify.get('/users', fetchUsers);

	// a la creation du pseudo 
	fastify.get('/exists', checkUserExists);

	// dans quels cas sont utilisees ces deux routes ?
	// fetchUserByName et fetchUserStatus seront utilisees dans la route /vs
	// + retirer le /users ici, car l'url finale ressemble a ca sinon:
	// http://localhost:3000/user/users/:name (c'est redondant)
	// remplacer par search ou fetch ?
	fastify.get('/users/:name', fetchUserByName);
	fastify.get('/users/:name/status', fetchUserStatus);

	fastify.post('/users', createUser);

	fastify.get('/random', getRandomUser);
	fastify.put('/update', changeState);
//	fastify.get('/vs', checkAvailability)
}

export default userRoutes;
