//app.js

import Fastify from 'fastify';
import twoFARoutes from './routes/routes.js';

const fastify = Fastify({ logger: true });

fastify.register(twoFARoutes);

async function start() {
	try {
		await fastify.listen({ port: 3000, host: `0.0.0.0` });
		console.log('2fa-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
