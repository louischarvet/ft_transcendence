import jwt from 'jsonwebtoken';
import { getAllFromTable, insertInTable, isInTable, deleteExpiredTokens } from '../models/models.js';

const secret = 'secret-key';

// Route POST /generate
export async function generateToken(request, reply) {
//	if (await isActiveUser)
//		return error : user token already defined

	const { name, type } = request.body;
	// try catch ?
	const token = await jwt.sign({
		name: name,
		type: type
	},
		secret,
		{ expiresIn : '1s' }
	);
	console.log("token: ", token);
	return reply.code(200).send({
		token: token,
		message: 'JWT created'
	})
}

// Route GET /authenticate
export async function authenticateUser(request, reply) {
	const token = request.headers.authorization?.split(' ')[1];

	if (!token)
		return reply.code(401).send({ error: 'Missing token' });
	try {
		if (await isInTable('revoked_tokens', 'token', token))
			return reply.code(401).send({ error: 'Token has been revoked' });

		const decoded = await jwt.verify(token, secret);
		// console.log("decoded: ", decoded);
		// console.log("decoded.exp: ", decoded.exp);
		return reply.code(200).send({
			user: decoded,
			message: 'Valid token'
		});
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

// Route POST /revoke
export async function revokeToken(request, reply) {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token)
		return reply.code(401).send({ error: 'Missing token' });

	try {
		const decoded = jwt.verify(token, secret);
		// console.log("decoded: ", decoded);
		// console.log("decoded.exp: ", decoded.exp);
		await insertInTable('revoked_tokens', { token: token, exp: decoded.exp });
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

// cron pour supprimer les tokens revoques ~ toutes les 30 minutes
export async function pruneExpiredTokens() {
	const time = await Math.floor( await Date.now() / 1000 );
	await deleteExpiredTokens(time);

//	const rows = await getAllFromTable('revoked_tokens');

	// console.log(rows);
}