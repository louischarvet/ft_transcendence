import Fastify from 'fastify'
import fs from 'fs'
import path from 'path'

import routes from './routes.js'
import shutdown from './shutdown.js'

// HTTPS
const options = {
	key: fs.readFileSync(path.join('/usr', 'src', 'app', 'ssl', 'proxy.key')),
	cert: fs.readFileSync(path.join('/usr', 'src', 'app', 'ssl', 'proxy.crt'))
};

const fastify = Fastify({
	logger: true,
	https: options
})

// Gestion des routes
fastify.register(routes)
fastify.register(shutdown)

// Listen
const start = async () => {
	try {
		await fastify.listen({port: 3000, host: '0.0.0.0'});
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
