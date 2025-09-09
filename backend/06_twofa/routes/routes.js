// routes/routes.js

import { sendCode, verifyCode } from '../controllers/controllers.js'
import { sendSchema, verifySchema } from '../schema/twoFASchema.js';

async function twoFARoutes(fastify, options) {
	fastify.post('/sendcode', { schema: sendSchema }, sendCode);
	fastify.post('/verifycode', { schema: verifySchema }, verifyCode);
//	fastify.get('/verifymail', { schema: twoFASchema }, verifyMail);
	//fastify.post('/mailgun', mailgun);
}

export default twoFARoutes;