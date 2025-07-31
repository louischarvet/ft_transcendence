import Fastify from 'fastify'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
//import fastifyHttpProxy from '@fastify/http-proxy'
import routesPlugin from './routes/routes.js'
import cors from '@fastify/cors'

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const httpsOptions = {
    key: fs.readFileSync(path.join(dirname, 'ssl/proxy.key')),
    cert: fs.readFileSync(path.join(dirname, 'ssl/proxy.crt'))
};


const server = Fastify({
    logger: false,
    //https: httpsOptions
})

await server.register(cors, {
  origin: 'http://localhost:5173', // ou '*' pour tout autoriser
  credentials: true
})

server.register(routesPlugin)

server.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
});