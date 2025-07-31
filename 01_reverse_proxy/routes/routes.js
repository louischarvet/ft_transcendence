import fastifyHttpProxy from '@fastify/http-proxy'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function routesPlugin(fastify, options) {
	// Configuration CORS pour permettre les requêtes depuis le frontend
	fastify.addHook('onRequest', async (request, reply) => {
		reply.header('Access-Control-Allow-Origin', '*')
		reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
		reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
		
		if (request.method === 'OPTIONS') {
			reply.send()
		}
	})

	// page d'accueil, route standard
	fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    })

	// Routes API pour les services backend
	fastify.register(fastifyHttpProxy, {
		upstream: "http://user-service:3000",
		prefix: '/api/user',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://match-service:3000",
		prefix: '/api/match',
		rewritePrefix: '/',
	});
	fastify.register(fastifyHttpProxy, {
		upstream: "http://tournament-service:3003",
		prefix: '/api/tournament',
		rewritePrefix: '/',
	});

	// Proxy pour le frontend React
	fastify.register(fastifyHttpProxy, {
		upstream: "http://frontend-service:5173",
		prefix: '/app',
		rewritePrefix: '/',
	});

	// Route par défaut pour servir le frontend
	fastify.get('*', async (request, reply) => {
		// Si ce n'est pas une route API, rediriger vers le frontend
		if (!request.url.startsWith('/api/')) {
			return reply.redirect('/app')
		}
	})
	
}

export default routesPlugin;

