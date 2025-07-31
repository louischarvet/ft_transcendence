//index.js

import Fastify from 'fastify';
import jwt from '@fastify/jwt'
import userRoutes from './routes/routes.js';

const fastify = Fastify({ logger: true });

fastify.register(jwt, {
	secret: 'secret-key'
});
fastify.register(userRoutes);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('User-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
