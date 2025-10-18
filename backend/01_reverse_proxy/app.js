import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import routesPlugin from './routes/routes.js';
import shutdown from './shutdown.js';

import fastifyHttpProxy from '@fastify/http-proxy';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Lire le certificat et la clé
const httpsOptions = {
    key: fs.readFileSync(path.join(dirname, 'ssl/proxy.key')),
    cert: fs.readFileSync(path.join(dirname, 'ssl/proxy.crt'))
};

// Créer le serveur Fastify avec HTTPS
const server = Fastify({ logger: true, https: httpsOptions });

// Enregistrer CORS
server.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ["Content-Type", "Authorization"],
});

// Enregistrer shutdown et routes
server.register(routesPlugin);
server.register(shutdown);

// Lancement du serveur
server.listen({ port: 443, host: '0.0.0.0' }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log('Reverse proxy is running on https://localhost');
});
