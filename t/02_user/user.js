import Fastify from 'fastify'

import routes from './routes.js'
import shutdown from './shutdown.js'

const fastify = Fastify({
	logger: false
})

// Imprimer la requete HTTP dans le terminal
// fastify.addHook('onRequest', async (request, reply) => {
//   console.log('///////////////////////////////////////////');
//   console.log('Method:', request.method);
//   console.log('URL:', request.url);
//   console.log('Headers:', request.headers);
//   console.log('Body:', request.body);
//   console.log('Query:', request.query);
//   console.log('Query.name:', request.query.name);
//   console.log('///////////////////////////////////////////');
//   //  console.log(reply);
// });

// Plugins
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