import fastifyHttpProxy from '@fastify/http-proxy'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function routesPlugin(fastify, options) {

	// page d'accueil, route standard
	fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    })

	// Routes API pour les services backend
	fastify.register(fastifyHttpProxy, {
		upstream: "http://user-service:3000",
		prefix: '/user',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://match-service:3000",
		prefix: '/match',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://tournament-service:3003",
		prefix: '/tournament',
		rewritePrefix: '/',
	});

}

export default routesPlugin;

