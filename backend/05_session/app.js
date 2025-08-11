// app.js

import Fastify from 'fastify';
//import jwt from '@fastify/jwt';
import jwt from 'jsonwebtoken';
import fastifyCron from 'fastify-cron';

import { sessionRoutes } from './routes/routes.js';
import { sessionInput } from './schema/sessionInput.js';
import { pruneExpiredTokens } from './controllers/controllers.js';

//const secret = "secret-key";
const fastify = Fastify({ logger: true });

// Authentification par token
//fastify.register(jwt);

// supprimer toutes les 30 minutes les tokens expires
// stockes dans revoked_tokens
fastify.register(fastifyCron, {
	jobs: [
		{
			cronTime: '*/30 * * * *',
			onTick: pruneExpiredTokens,
			start: true,
			timeZone: 'Europe/Paris'
		}
	]
});

fastify.register(sessionRoutes);

fastify.addSchema(sessionInput);

const start = async () => {
	try {
		await fastify.listen({ port: 3005, host: '0.0.0.0' });
		console.log('Session-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
