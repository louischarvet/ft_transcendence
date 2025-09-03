import jwt from 'jsonwebtoken';
import { userAndTokenMatch, insertInTable, isInTable, deleteExpiredTokens } from '../models/models.js';

const secret = 'secret-key';

// Route POST /generate
export async function generateToken(request, reply) {
	const { name, type, id, hashedPassword } = request.body;
	const token = await jwt.sign({
//		name: name,
		type: type,
		id: id,
	//	hashedPassword: hashedPassword
	},
		secret,
		{ expiresIn : '2h' }
	);

	const iat = (jwt.verify(token, secret)).iat;

	return reply.code(200).send({
		token: token,
		iat: iat,
		message: 'JWT created'
	})
}

// Route GET /authenticate
export async function authenticateUser(request, reply) {
	const token = request.headers.authorization.split(' ')[1];

	if (!token)
		return reply.code(401).send({ error: 'Missing token' });
	try {
		if (await isInTable('revoked_tokens', 'token', token))
			return reply.code(401).send({ error: 'Token is already revoked' });

		const decoded = await jwt.verify(token, secret);
	//	console.log("//// body\n", request.body);
		if (await userAndTokenMatch(decoded, request.body)) {
			return reply.code(200).send({
				user: decoded,
				message: 'Valid token'
			});
		} else {
			return reply.code(401).send({ error: "Token and user infos don't match" });
		}
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
		if (await isInTable('revoked_tokens', 'token', token))
			return reply.code(401).send({ error: 'Token is already revoked' });

		const decoded = await jwt.verify(token, secret);
		await insertInTable('revoked_tokens', { token: token, exp: decoded.exp });
		return reply.code(200).send({ message: 'Token has been revoked' });
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

// cron pour supprimer les tokens revoques ~ toutes les 30 minutes
export async function pruneExpiredTokens() {
	const time = await Math.floor( await Date.now() / 1000 );
	await deleteExpiredTokens(time);
}