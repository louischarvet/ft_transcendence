//index.js

import routesPlugin from './routes/routes.js';
import Fastify from 'fastify';
import { initDB } from './database/db.js';
import { tournamentSchema } from './schema/tournamentSchema.js';

const fastify = Fastify({ logger: true });

fastify.register(routesPlugin);

// On instencie les Schemas de JSONs
fastify.addSchema(tournamentSchema);

//! ajout le 16/09/2025
await initDB();

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
