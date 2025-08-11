// app.js

import Fastify from 'fastify';
//import jwt from '@fastify/jwt';
import jwt from 'jsonwebtoken';
import { sessionRoutes } from './routes/routes.js';

import { sessionInput } from './schema/sessionInput.js';

//const secret = "secret-key";
const fastify = Fastify({ logger: true });

// Authentification par token
//fastify.register(jwt);

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
