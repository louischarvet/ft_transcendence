// routes/routes.js

import { sendMail } from '../controllers/controllers.js'
import { twoFASchema } from '../schema/twoFASchema.js';

async function twoFARoutes(fastify, options) {
	fastify.post('/sendmail', sendMail);
//	fastify.get('/verifymail', { schema: twoFASchema }, verifyMail);
}

export default twoFARoutes;