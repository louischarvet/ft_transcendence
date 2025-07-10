import Fastify from 'fastify'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
//import fastifyHttpProxy from '@fastify/http-proxy'
import routesPlugin from './routes.js'
import shutdownPlugin from './shutdown.js'

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const httpsOptions = {
    key: fs.readFileSync(path.join(dirname, 'ssl/proxy.key')),
    cert: fs.readFileSync(path.join(dirname, 'ssl/proxy.crt'))
};

const server = Fastify({
    logger: true,
    https: httpsOptions
})

server.register(routesPlugin)
server.register(shutdownPlugin)

server.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
});