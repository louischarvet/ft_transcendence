async function routesPlugin(fastify, options) {
	fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    })
	fastify.get('/auth', async (request, reply) => {
		try {
			const response = await fetch('http://auth:3001/data');
			const data = await response.json();

			return (data); ////
		} catch (error) {
			fastify.log.error(error);
			reply.status(500).send({ error: 'Internal Server Error' });
		}
	})
}

export default routesPlugin;