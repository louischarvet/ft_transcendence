// app.js

import Fastify from 'fastify';
import jwt from '@fastify/jwt';

const fastify = Fastify({ logger: true });

// Authentification par token
fastify.register(jwt, {
	secret: 'secret-key'
});

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('Session-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
