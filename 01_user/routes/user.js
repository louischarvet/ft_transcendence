import { checkUserExists, sayHello } from '../controllers/user.js';

async function userRoutes(fastify, options) {
	fastify.get('/exists', checkUserExists);
	fastify.get('/hello', sayHello);
	fastify.get('/api/users/:name', async (request, reply) => {
		const { name } = request.params;
		const db = await open({ filename: '/usr/src/app/users_db', driver: sqlite3.Database });
		const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
		if (!user)
			return reply.code(404).send({ error: 'User not found' });
		return user;
	});
}

export default userRoutes;
