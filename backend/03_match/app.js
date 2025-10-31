import Fastify from 'fastify';
import cookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors';
import fp from 'fastify-plugin';

import { authenticateJWT } from './authentication/auth.js'
import routes from './routes/routes.js';
import { matchSchema, registeredMatchSchema, tournamentMatchSchema }
	from './schema/matchSchema.js';
import { initDB } from './database/db.js';
import shutdownPlugin from './common_tools/shutdown.js';

const fastify = Fastify({ logger: true });

fastify.register(cookie);

fastify.register(fastifyCors, {
	origin: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
});

//! ne foncionne pas car 
/*
	tu fais await fastify.register(...), alors que fastify.register() avec un plugin async n’a pas besoin d’être awaité.
	Ça ne casse pas forcément, mais il faut s’assurer que initDB fait bien fastify.decorate('db', db) avant que tes routes utilisent db.
*/
//await fastify.register(fp(initDB));
fastify.register(fp(async (fastify, opts) => {
	await initDB(fastify);
}));

fastify.decorate('authentication', authenticateJWT);

fastify.addSchema(registeredMatchSchema);	
fastify.addSchema(matchSchema);
fastify.addSchema(tournamentMatchSchema);
fastify.register(routes);
fastify.register(shutdownPlugin);

async function start() {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('match_docker listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();