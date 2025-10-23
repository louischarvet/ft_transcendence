//app.js

import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

import twoFARoutes from './routes/routes.js';
import { initDB } from './database/database.js';
import shutdown from './common_tools/shutdown.js';
import fastifyCors from '@fastify/cors';

await config();

const fastify = Fastify({ logger: true });

fastify.register(cookie);

// CORS configuration
fastify.register(fastifyCors, {
	origin: true, // Réfléchit le domaine de la requête
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
});


fastify.register( async () => {
	const transporter = await nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.USR_ADDR,
			pass: process.env.APP_PASS
		}
	});
	
	// verification de la connexion pour envoi d'email
	await transporter.verify((error, success) => {
		if (error) {
			// fetch exit pour tous les containers
			//	fetchExitSMTPError();
			console.error('Erreur de connexion :', error.message);
			process.exit(2);
		} else
			console.log('Connexion réussie : les identifiants sont valides.');
			transporter.close(); // Ferme la connexion
		});
	});
	
fastify.register(initDB);
fastify.register(twoFARoutes);
fastify.register(shutdown);
	
	
async function start() {
	try {
		await fastify.listen({ port: 3000, host: `0.0.0.0` });
		console.log('2fa-service listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
