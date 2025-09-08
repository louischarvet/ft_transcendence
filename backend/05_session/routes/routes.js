import { generateToken, authenticateUser, revokeToken, pruneExpiredTokens } from '../controllers/controllers.js'
import { sessionInput } from '../schema/sessionInput.js';
import { userSchema } from '../schema/userSchema.js'

export async function sessionRoutes(fastify, options) {
	// generer un token
	fastify.post('/generate', { schema: sessionInput }, generateToken);
	// verifier un token // joindre un userSchema
	// et verifier la correspondance du name avec le token ?
	fastify.post('/authenticate', { schema: userSchema }, authenticateUser);
	// revoquer un token (le rendre inactif an attendant son expiration)
	fastify.post('/revoke', { schema: userSchema }, revokeToken);

	// route test pour supprimer les JWT expires
	fastify.get('/test', pruneExpiredTokens);
}