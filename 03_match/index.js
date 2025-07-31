import Fastify from 'fastify';
import jwt from '@fastify/jwt'

import routes from './routes/routes.js';

const fastify = Fastify({ logger: true });

fastify.register(jwt, {
	secret: 'secret-key'
});

fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify(); // Le token est validé ici
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.register(routes);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('match_docker listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();