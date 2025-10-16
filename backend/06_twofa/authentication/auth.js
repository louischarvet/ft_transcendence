// ./authentification.auth.js
// specific to twofa service (tmp accessToken -> verified === false)

export async function generateJWT(user) {
//	console.log("///generateGWT twofaservice . user : \t", user);
	const genRes = await fetch('http://session-service:3000/generate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user)
	});
	return genRes;
}

export async function authenticateJWT(request, reply) {
	const { accessToken } = request.cookies;
	if (accessToken === undefined)
		return reply.code(400).send({
			error: 'Access token missing.'
		});
	const authRes = await fetch('http://session-service:3000/authenticate', {
		method: 'GET',
		headers: {
			'Authorization': accessToken,
//			'Accept': 'application/json'
		},
	});
	const data = await authRes.json();
	if (data.verified === true)
		return reply.code(403).send({ error: 'User already verified.' });
	if (data.error)
		return reply.code(authRes.status).send({ error: data.error });
	request.user = data;
}

export async function revokeJWT(token) {
	if (!token)
		return { status: 400, error: 'Unauthorized: No token provided' }; // 401 ?
	const revRes = await fetch('http://session-service:3000/revoke', {
		method: 'DELETE',
		headers: {
			'Authorization': token,
		}
	});
	return (revRes);
}