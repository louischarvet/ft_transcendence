import { checkUserExists, sayHello } from '../controllers/userController.js';

async function userRoutes(fastify, options) {
	fastify.get('/exists', checkUserExists);
	fastify.get('/hello', sayHello);
}

export default userRoutes;
