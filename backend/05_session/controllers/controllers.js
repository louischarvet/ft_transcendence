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

	// fonction a part ? (utiliser dans replace egalement)
	const token = await jwt.sign({
		name: name,
		type: type,
		id: id,
	},
		secret,
		{ expiresIn : '2h' }
	);

	const { iat, exp } = await jwt.verify(token, secret);
	await insertInActiveTokensTable(name, id, type, iat, exp);
	//

	return reply.code(200).send({
		token: token,
		message: 'JWT created'
	})
}

// Route GET /authenticate
export async function authenticateUser(request, reply) {
	const token = request.headers.authorization.split(' ')[1] || request.headers.authorization;

	console.log("### authenticateUser : request.headers.authorization -->",request.headers.authorization);
	console.log("### authenticateUser : token -->",token);
	if (!token) {
		console.log('Missing token');
		return reply.code(401).send({ error: 'Missing token' });
	}
	try {
		if (await isInTable('revoked_tokens', 'token', token)) {
			console.log('Token is already revoked');
			return reply.code(401).send({ error: 'Token is already revoked' });
		}

		const decoded = await jwt.verify(token, secret);
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
		//	console.log("Token and user infos don't match");
			return reply.code(401).send({ error: "Token is invalid." });
		}
	} catch (err) {
	//	console.log('Invalid token');
		return reply.code(401).send({ error: 'Token cannot be verified.' });
	}
}

// Route POST /revoke
export async function revokeToken(request, reply) {
	const token = request.headers.authorization.split(' ')[1] || request.headers.authorization;
	console.log("token in revToken 05-SESSION --->", token);
	if (!token)
		return reply.code(401).send({ error: 'Missing token' });

	try {
		if (await isInTable('revoked_tokens', 'token', token))
			return reply.code(401).send({ error: 'Token is already revoked' });

		// fonction a part
		const decoded = await jwt.verify(token, secret);
		const { name, id, type, exp } = decoded;
		await insertInTable('revoked_tokens', { token: token, exp: exp });
		await deleteInActiveTokensTable(name);
		await fetchChangeStatus({ name, id, type }, 'logged_out');

		return reply.code(200).send({ message: 'Token has been revoked' });
	} catch (err) {
		return reply.code(401).send({ error: 'Invalid token' });
	}
}

// Route POST pour renouveller un token au lancement d'un match ou d'un tournoi
export async function replaceToken(request, reply) {
	console.log("########## BODY:\n", request.body);
	const oldToken = request.body.token;

	try {
		const decoded = await jwt.verify(oldToken, secret);
		const { name, id, type } = decoded;
		deleteInActiveTokensTable(name);

		// fonction a part ?
		const newToken = await jwt.sign({
			name: name,
			type: type,
			id: id,
		},
			secret,
			{ expiresIn : '2h' }
		);
		const { iat, exp } = await jwt.verify(newToken, secret);
		await insertInActiveTokensTable(name, id, type, iat, exp);
		//

		return reply.code(200).send({ token: newToken, message: 'New token created.' })
	} catch (err) {
		console.log(err);
		return reply.code(400).send({ error: 'Invalid token' });
	}
}
