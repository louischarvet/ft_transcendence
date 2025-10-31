import Fastify from 'fastify';
import routesPlugin from './routes/routes.js';
import { initDB } from './database/db.js';
import fastifyCors from '@fastify/cors';
import cookie from '@fastify/cookie';
import shutdownPlugin from './common_tools/shutdown.js';

import { tournamentSchema } from './schema/tournamentSchema.js';

const fastify = Fastify({ logger: true });

// Middlewares / plugins
fastify.register(cookie);

fastify.register(fastifyCors, {
	origin: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
});

// Schemas
fastify.addSchema(tournamentSchema);

// Routes
fastify.register(routesPlugin);

// Shutdown plugin
fastify.register(shutdownPlugin);

// Init DB avant de lancer le serveur
await initDB();

async function start() {
	try {
		const address = await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log(`Server listening on ${address}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
