import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { userAndTokenMatch, insertInActiveTokensTable, insertInTable,
	isInTable, deleteExpiredTokens, deleteInActiveTokensTable, getExpiredTokens }
	from '../models/models.js';
import { fetchChangeStatus } from './fetchFunctions.js';

//const secret = speakeasy.generateSecret().base32;
const secret = 'secret-key';

// Route POST /generate
export async function generateToken(request, reply) {
	const { name, type, id } = request.body;
	const token = jwt.sign({
		name: name,
		type: type,
		id: id,
	},
		secret,
		{ expiresIn : '1m' }
	);

	const { iat, exp } = jwt.verify(token, secret);
	await insertInActiveTokensTable(name, id, type, iat, exp);

	return reply.code(200).send({
		token: token,
		message: 'JWT created'
	})
}

// Route GET /authenticate
export async function authenticateUser(request, reply) {
	const token = request.headers.authorization.split(' ')[1];

	if (!token) {
		console.log('Missing token');
		return reply.code(401).send({ error: 'Missing token' });
	}
	try {
		if (await isInTable('revoked_tokens', 'token', token)) {
			console.log('Token is already revoked');
			return reply.code(401).send({ error: 'Token is already revoked' });
		}

		const decoded = jwt.verify(token, secret);
//		if (await userAndTokenMatch(decoded, request.body)) {
		if (await userAndTokenMatch(decoded)) {
			return reply.code(200).send({
				user: {
					name: decoded.name,
					id: decoded.id,
					type: decoded.type
				},
				message: 'Valid token'
			});
		} else {
			console.log("Token and user infos don't match");
			return reply.code(401).send({ error: "Token and user infos don't match" });
		}
	} catch (err) {
		console.log('Invalid token');
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

// Route POST /revoke
export async function revokeToken(request, reply) {
	const token = request.headers.authorization.split(' ')[1];
	if (!token)
		return reply.code(401).send({ error: 'Missing token' });

	try {
		if (await isInTable('revoked_tokens', 'token', token))
			return reply.code(401).send({ error: 'Token is already revoked' });

		// fonction a part
		const decoded = jwt.verify(token, secret);
		const { name, id, type, exp } = decoded;
		await insertInTable('revoked_tokens', { token: token, exp: exp });
		await deleteInActiveTokensTable(name);
		await fetchChangeStatus({ name, id, type }, 'logged_out');

		return reply.code(200).send({ message: 'Token has been revoked' });
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

// cron pour supprimer les tokens revoques ~ toutes les 30 minutes
export async function pruneExpiredTokens() {
	const time = Math.floor( Date.now() / 1000 );
	await deleteExpiredTokens(time);
}

// cron pour revoquer les tokens actifs mais expires
export async function revokeExpiredTokens() {
	const time = Math.floor( Date.now() / 1000 );
	const tokens = await getExpiredTokens(time);
	console.log("###################### revokeExpiredTokens\n");
	console.log("###################### tokens:\n", tokens);
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		console.log("####################### token: ", token);

		const { user_name, user_id, user_type, exp } = token;
		await insertInTable('revoked_tokens', { token: token, exp: exp });
		await deleteInActiveTokensTable(user_name);
		await fetchChangeStatus({ name: user_name, id: user_id, type: user_type }, 'logged_out');
	}
}