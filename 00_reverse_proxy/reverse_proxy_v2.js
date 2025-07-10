import Fastify from 'fastify'
import fastifyHttpProxy from '@fastify/http-proxy'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const httpsOptions = {
    key: fs.readFileSync(path.join(dirname, 'ssl/proxy.key')),
    cert: fs.readFileSync(path.join(dirname, 'ssl/proxy.crt'))
};

const server = fastify({
    logger: true,
    https: httpsOptions
})

server.register(fastifyHttpProxy, {

})

server.register(routes)
server.register(shutdown)

