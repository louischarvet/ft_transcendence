export default async function shutdownPlugin(fastify) {
	fastify.addHook('onClose', async () => {
		fastify.log.info('Serveur Match fermé proprement.');
	});
}
