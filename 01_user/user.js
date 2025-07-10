import Fastify from 'fastify'
import routes from './routes.js'
import shutdown from './shutdown.js'

const fastify = Fastify({
	logger: true
})

// Routes
fastify.register(routes)
fastify.register(shutdown)

// Listen
const start = async () => {
	try {
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
		console.log('auth listening on port 3001');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();