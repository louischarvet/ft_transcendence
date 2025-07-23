import shutdown from './common_tools/shutdown.js';
import routes from './routes/routes.js';
import { Pool } from './models/tournaments.js';
import Fastify from 'fastify';
import { initializeDatabase } from './database/db.js';
//npm install @fastify/cors
//const cors = require('@fastify/cors');

//fastify.register(cors, {
//  origin: true // Réfléchit le domaine de la requête dans l'en-tête CORS Access-Control-Allow-Origin
//});
const fastify = Fastify({ logger: true });

fastify.register(routes);

// Une route pour connecter au frontend ! Cette requette depuis le front a tester
fastify.get('/api/data', async (request, reply) => {
	return { message: "Hello from the Fastify backend!" };
});

async function start() {
  	await Pool.initializeDatabase();
	try {
		await initializeDatabase();
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
		console.log('Server listening on port 3001');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
