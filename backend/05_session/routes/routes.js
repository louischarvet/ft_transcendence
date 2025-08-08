import { generateToken } from '../controllers/controllers.js'

async function sessionRoutes(fastify, options) {
	fastify.post('/generate', { schema: sessionInput }, generateToken);
}