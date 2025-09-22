import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import routesPlugin from './routes/routes.js';
import shutdown from './shutdown.js'

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

//! a suprrimer apres
const server = Fastify({ logger: false });

//test connection
console.log('Starting server ...');

// Enregistrez le plugin CORS
server.register(fastifyCors, {
    origin: true, // Réfléchit le domaine de la requête
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ["Content-Type", "Authorization"],
});

console.log('after registering CORS ...');
// Enregistrez vos routes
server.register(routesPlugin);
server.register(shutdown);

console.log('after registering routes ...');
server.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
	console.log('after starting server...');
	if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log('Server is running on http://localhost:3000');
});
