//index.js

import shutdown from './common_tools/shutdown.js';
import routes from './routes/user.js';
import Fastify from 'fastify';
import { initializeDatabase } from './database/db.js';

const fastify = Fastify({ logger: true });

fastify.register(routes);

const start = async () => {
	try {
		await initializeDatabase();
		console.log('Database initialized');
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
		console.log('Server listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
