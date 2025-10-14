// routes/routes.js

import { sendCode, verifyCode } from '../controllers/controllers.js'
import { sendSchema, verifySchema } from '../schema/twoFASchema.js';
import { authenticateJWT } from '../authentication/auth.js';

async function twoFARoutes(fastify, options) {
	fastify.post('/sendcode', { schema: sendSchema }, sendCode);
	fastify.post('/verifycode', { preHandler: authenticateJWT, schema: verifySchema }, verifyCode);
}

export default twoFARoutes;