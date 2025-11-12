import fastifyHttpProxy from '@fastify/http-proxy'

async function routesPlugin(fastify, options) {
	// page d'accueil, route standard
	fastify.get('/ping', async (request, reply) => {
        return reply.code(200).send({
			hello: 'world',
			status: 'ok'
		});
    });

	// Routes interdites
	fastify.put('/user/changestatus', async (request, reply) => {
		return reply.code(400).send({ error: 'Forbidden route.' });
	});
	fastify.put('/user/updatestats', async (request, reply) => {
		return reply.code(400).send({ error: 'Forbidden route.' });
	});
	fastify.post('/match/tournament', async (request, reply) => {
		return reply.code(400).send({ error: 'Forbidden route.' });
	});

	// Redirections
	fastify.register(fastifyHttpProxy, {
		upstream: "http://user-service:3000",
		prefix: '/user',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://match-service:3000",
		prefix: '/match',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://tournament-service:3000",
		prefix: '/tournament',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://session-service:3000/refresh",
		prefix: '/refresh',
		rewritePrefix: '',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://twofa-service:3000",
		prefix: '/twofa',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
	upstream: "http://blackjack-service:3000",
	prefix: '/blackjack',
	rewritePrefix: '/',
	websocket: true
	});

	// HTTPS ?
	// fastify.post('/session/refresh', async (request, reply) => {
	// 	try {
	// 		const response = await fetch('http://session-service:3000/refresh', {
	// 			method: 'POST',
	// 			headers: {
	// 				'Authorization': request.headers.authorization,
	// 			}
	// 		});
	// 		const data = await response.json();
	// 		return reply.code(200).send(data);
	// 	} catch (error) {
	// 		fastify.log.error(error);
	// 		reply.status(500).send({ error: 'Internal Server Error' });
	// 	}
	// });
	
/*	fastify.get('/auth', async (request, reply) => {
		try {
			const response = await fetch('http://auth:3001/data');
			const data = await response.json();

			return (data); ////
		} catch (error) {
			fastify.log.error(error);
			reply.status(500).send({ error: 'Internal Server Error' });
		}
	})
*/
	
}

export default routesPlugin;

