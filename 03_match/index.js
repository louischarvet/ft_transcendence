import Fastify from 'fastify';
import routes from './routes/routes.js';
import shutdown from './common_tools/shutdown.js';
import { initializeDatabase } from './database/db.js';

const fastify = Fastify({ logger: true });

fastify.register(routes);
fastify.register(shutdown);

const start = async () => {
	try {
		await initializeDatabase();
		await fastify.listen({ port: 3002, host: '0.0.0.0' });
		console.log('match_docker listening on port 3002');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();