import { generateToken, authenticateUser, revokeToken, replaceToken } from '../controllers/controllers.js'
import { sessionInput, replaceSchema } from '../schema/sessionInput.js';
import { userSchema } from '../schema/userSchema.js'

export async function sessionRoutes(fastify, options) {
	// generer un token
	fastify.post('/generate', { schema: sessionInput }, generateToken);
	// verifier un token // joindre un userSchema
	// et verifier la correspondance du name avec le token ?
	fastify.post('/authenticate', authenticateUser);
	// revoquer un token (le rendre inactif an attendant son expiration)
	fastify.post('/revoke', revokeToken);

	// Route interne pour renouveller un token au lancement d'un match ou d'un tournoi
	fastify.post('/replace', { schema: replaceSchema }, replaceToken);
}