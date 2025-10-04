// app.js

import Fastify from 'fastify';
import fastifyCron from 'fastify-cron';

import { sessionRoutes } from './routes/routes.js';

//import { sessionInput } from './schema/sessionInput.js';
import { userSchema } from './schema/userSchema.js';

import { pruneExpiredTokens, revokeExpiredTokens } from './cron/cronFunctions.js';

//const secret = "secret-key";
const fastify = Fastify({ logger: true });

// supprimer toutes les 30 minutes les tokens expires
// stockes dans revoked_tokens
fastify.register(fastifyCron, {
	jobs: [
		{
			cronTime: '*/30 * * * *',
			onTick: pruneExpiredTokens,
			start: true,
			timeZone: 'Europe/Paris'
		},
		{
			cronTime: '*/1 * * * *',
			onTick: revokeExpiredTokens,
			start: true,
			timeZone: 'Europe/Paris'
		}
	]
});

fastify.register(sessionRoutes);

//fastify.addSchema(sessionInput);
fastify.addSchema(userSchema);

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
