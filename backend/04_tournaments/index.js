//index.js

import routesPlugin from './routes/routes.js';
import Fastify from 'fastify';
import { initDB } from './database/db.js';
import fastifyCors from '@fastify/cors';
import { tournamentSchema } from './schema/tournamentSchema.js';
import cookie from '@fastify/cookie'
import shutdownPlugin from './common_tools/shutdown.js';
const fastify = Fastify({ logger: true });

fastify.register(routesPlugin);

fastify.register(cookie);

// On instencie les Schemas de JSONs
fastify.addSchema(tournamentSchema);
fastify.register(shutdownPlugin);

//! ajout le 16/09/2025
await initDB();

fastify.register(fastifyCors, {
	origin: true, // Réfléchit le domaine de la requête
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
});

////!ajout le 18/09/2025
////permet de gerer les attaques XSS
//await fastify.register(helmet, {
//	global: true
////});

async function start() {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('Server listening on port 3001');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
