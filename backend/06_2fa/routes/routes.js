// routes/routes.js

import { verifyMail, mailgun } from '../controllers/controllers.js'
import { twoFASchema } from '../schema/twoFASchema.js';

async function twoFARoutes(fastify, options) {
	fastify.post('/verifymail', { schema: twoFASchema }, verifyMail);
//	fastify.get('/verifymail', { schema: twoFASchema }, verifyMail);
	fastify.post('/mailgun', mailgun);
}

export default twoFARoutes;