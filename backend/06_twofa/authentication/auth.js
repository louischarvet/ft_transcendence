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
//	console.log("//// body\n", body);
	const token = request.headers.authorization;
	if (!token)
		return reply.code(401).send({ error: 'Unauthorized: No token provided' });
	console.log("#################### TWOFA auth\n", token,
				"\n###############################\n");
	const authRes = await fetch('http://session-service:3000/authenticate', {
		method: 'GET',
		headers: {
			'Authorization': token,
//			'Accept': 'application/json'
		},
	});
	const data = await authRes.json();
	console.log("############################ TWOFA auth DATA:\n", data,
				"\n#############################################\n");
	if (data.error)
		return reply.code(401).send({ error: data.error });
	request.user = data;
}

export async function revokeJWT(token) {
	if (!token)
		return { status: 401, error: 'Unauthorized: No token provided' };
	const revRes = await fetch('http://session-service:3000/revoke', {
		method: 'DELETE',
		headers: {
			'Authorization': token,
		}
	});
	return (revRes);
}