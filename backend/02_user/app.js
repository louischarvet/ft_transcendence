//app.js

import Fastify from 'fastify';
import jwt from '@fastify/jwt'
import authenticateJWT from './authentication/auth.js'
import userRoutes from './routes/routes.js';
import { userInput } from './schema/userInput.js';
import { userSchema } from './schema/userSchema.js';

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
	secret: 'secret-key'
});

fastify.decorate('authentication', authenticateJWT);

// On instencie les routes
fastify.register(userRoutes);
// On instencie les Schemas de JSONs
fastify.addSchema(userInput);
fastify.addSchema(userSchema);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('User-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
