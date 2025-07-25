import fastifyHttpProxy from '@fastify/http-proxy'

async function routesPlugin(fastify, options) {
	// page d'accueil, route standard
	fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    })
	fastify.register(fastifyHttpProxy, {
		upstream: "http://user-service:3001",
		prefix: '/user',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://match-service:3002",
		prefix: '/match',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://tournament-service:3003",
		prefix: '/tournament',
		rewritePrefix: '/',
	});
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

