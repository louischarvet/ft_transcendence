//app.js

import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import twoFARoutes from './routes/routes.js';
import { initDB } from './database/database.js';
import shutdown from './shutdown.js';

const fastify = Fastify({ logger: true });

fastify.register(cookie);

fastify.register(initDB);
fastify.register(twoFARoutes);
fastify.register(shutdown);

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
