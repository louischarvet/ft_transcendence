import Fastify from 'fastify';
//import jwt from '@fastify/jwt'

import { authenticateJWT } from './authentication/auth.js'
import routes from './routes/routes.js';
import { matchSchema, registeredMatchSchema, tournamentMatchSchema } from './schema/matchSchema.js';

import cookie from '@fastify/cookie'
import shutdownPlugin from './common_tools/shutdown.js';

const fastify = Fastify({ logger: true });

fastify.register(cookie);

//fastify.register(jwt, {
//	secret: 'secret-key'
//});

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