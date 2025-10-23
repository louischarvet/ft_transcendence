//app.js

import Fastify from 'fastify';
import fastifyCron from 'fastify-cron';
import cookie from '@fastify/cookie'
// Pour le upload les images
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
//!ajout le 18/09/2025
//permet de gerer les attaques XSS
import helmet from '@fastify/helmet';

import fastifyStatic from '@fastify/static';
import path from 'path';

import userRoutes from './routes/routes.js';
import { registerInput, loginInput, updateSchema } from './schema/userInput.js';
import { userSchema } from './schema/userSchema.js';
//! ajout le 16/09/2025
import { initDB } from './database/db.js';
import { prunePendingRegistered } from './cron/cronFunctions.js';
import shutdownPlugin from './common_tools/shutdown.js';

const fastify = Fastify({ logger: true });

fastify.register(cookie);

// CORS configuration
fastify.register(fastifyCors, {
    origin: true, // Réfléchit le domaine de la requête
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
});

fastify.register(fastifyStatic, {
	root: path.join(process.cwd(), 'pictures'),
	prefix: '/pictures/', // toutes les images seront accessibles via /pictures/nom_fichier
});

//!ajout le 18/09/2025
//permet de gerer les attaques XSS
await fastify.register(helmet, {
	global: true
});

// supprimer toutes les 15 minutes les registered pending qui n'ont pas fait le 2fa
fastify.register(fastifyCron, {
	jobs: [
		{
			cronTime: '*/10 * * * *',
			onTick: prunePendingRegistered,
			start: true,
			timeZone: 'Europe/Paris'
		}
	]
});

// On instencie les Schemas de JSONs
fastify.addSchema(registerInput);
fastify.addSchema(loginInput);

fastify.addSchema(updateSchema);
fastify.addSchema(userSchema);

fastify.register(fastifyMultipart);
fastify.register(userRoutes);
fastify.register(shutdownPlugin);

//! ajout le 16/09/2025
await initDB();

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
