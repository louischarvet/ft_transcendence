// app.js

import Fastify from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import { initDB } from './database/db.js';
import { sessionRoutes } from './routes/routes.js';
import { generateSchema } from './schema/generateSchema.js';

// generer secret-key !!!
const secretKey = "secret-key"

const fastify = Fastify({ logger: true });

// cookies
fastify.register(cookie);

// JWT
fastify.register(fastifyJWT, { secret: secretKey });

// DB
fastify.register(fp(initDB));

// Routes
fastify.register(sessionRoutes);

// Schema
fastify.addSchema(generateSchema);


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