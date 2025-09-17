//app.js

import Fastify from 'fastify';
import jwt from '@fastify/jwt'
//import authenticateJWT from './authentication/auth.js'
import userRoutes from './routes/routes.js';
import { registerInput, loginInput, updateSchema } from './schema/userInput.js';
import { userSchema } from './schema/userSchema.js';

import { authenticateJWT } from "./authentication/auth.js";
import fastifyMultipart from '@fastify/multipart';

const fastify = Fastify({ logger: true });


// CORS configuration
import fastifyCors from '@fastify/cors';
fastify.register(fastifyCors, {
    origin: true, // Réfléchit le domaine de la requête
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ["Content-Type", "Authorization"],
});


// Authentification par token
fastify.register(jwt, {
	secret: 'secret-key' //! A modifier -- >.env
});

//fastify.addHook('preHandler', authenticateJWT);

//fastify.decorate('authentication', authenticateJWT);

// On instencie les Schemas de JSONs
fastify.addSchema(registerInput);
fastify.addSchema(loginInput);

fastify.addSchema(updateSchema);
fastify.addSchema(userSchema);

fastify.register(fastifyMultipart);
fastify.register(userRoutes);


async function start() {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('User-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
