//index.js

import shutdown from './common_tools/shutdown.js';
import routes from './routes/routes.js';
import { Pool } from './models/tournaments.js';
import Fastify from 'fastify';
import { initializeDatabase } from './database/db.js';
import { createSampleData } from './controllers/tournaments.js';

const fastify = Fastify({ logger: true });

fastify.register(routes);

// Une route pour connecter au frontend ! Cette requette depuis le front a tester
fastify.get('/api/data', async (request, reply) => {
	return { message: "Hello from the Fastify backend!" };
});

async function start() {
  	//await Pool.initializeDatabase();
	try {
		await initializeDatabase();
		//await createSampleData();
		await fastify.listen({ port: 3003, host: '0.0.0.0' });
		console.log('Server listening on port 3001');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
