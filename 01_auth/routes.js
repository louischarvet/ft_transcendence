async function routesPlugin(fastify, options) {
	fastify.get('/data', async (request, reply) => {
		return { message: "Hello from auth", test: { testA: "Blob", testB: "Blub" } };
	})
}

export default routesPlugin;