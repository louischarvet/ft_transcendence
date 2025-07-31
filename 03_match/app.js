import Fastify from 'fastify';
import jwt from '@fastify/jwt'

import { authenticateJWT } from './authentication/auth.js'
import routes from './routes/routes.js';
import { userSchema, matchSchema } from './schema/matchSchema.js';


const fastify = Fastify({ logger: true });

fastify.register(jwt, {
	secret: 'secret-key'
});

fastify.decorate("authenticate", authenticateJWT);

fastify.register(routes);
fastify.addSchema(userSchema);
fastify.addSchema(matchSchema);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('match_docker listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();