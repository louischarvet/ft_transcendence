// ./authentification.auth.js

export async function generateJWT(user) {
	console.log("///generateGWT twofaservice . user : \t", user);
	const genRes = await fetch('http://session-service:3000/generate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user)
	});
	return genRes;
}

export async function authenticateJWT(token, body) {
//	console.log("//// body\n", body);
	const authRes = await fetch('http://session-service:3000/authenticate', {
		method: 'POST',
		headers: {
			'Authorization': token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	return authRes;
}

export async function revokeJWT(token, body) {
	const revRes = await fetch('http://session-service:3000/revoke', {
		method: 'POST',
		headers: {
			'Authorization': token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	return (revRes);
}