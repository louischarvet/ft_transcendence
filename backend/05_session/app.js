// app.js

import Fastify from 'fastify';
import fastifyJWT from '@fastify/jwt';
import { sessionRoutes } from './routes/routes.js';
import { generateSchema } from './schema/generateSchema.js';
import { initDB } from './models/models.js';

// generer secret-key !!!
const secretKey = "secret-key"

const fastify = Fastify({ logger: true });

// JWT
fastify.register(fastifyJWT, { secret: secretKey });

// Routes
fastify.register(sessionRoutes);

// Schema
fastify.addSchema(generateSchema);

// DB
fastify.register(initDB);
await initDB();

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