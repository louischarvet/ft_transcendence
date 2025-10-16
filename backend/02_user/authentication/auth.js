// ./authentification.auth.js
import { getUserByName } from "../models/models.js";

export async function generateJWT(user) {
	if (!user)
		return { status: 400, error: 'Bad Request: User information is incomplete' };
	
	const res = await fetch('http://session-service:3000/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user)
	});
	const data = await res.json();
//	console.log("######## genRes\n", genRes, "#######\n");
	return data;
}

export async function authenticateJWT(request, reply) {
	if (!request.headers.authorization)
		return reply.code(400).send({ error: 'Unauthorized: No token provided' });
    // Appel vers le session-service
    const authRes = await fetch('http://session-service:3000/authenticate', {
        method: 'GET',
        headers: {
            'Authorization': request.headers.authorization
        }
    });
	if (!authRes.ok) {
		return reply.code(authRes.status).send({ error: 'Unauthorized: Invalid token' });
	}
    const data = await authRes.json();
	if (data.verified === false)
		return reply.code(400).send({ error: 'User not verified.' });
	if (data.error)
		return reply.code(authRes.status).send({ error: data.error });

    request.user = data;
}


export async function revokeJWT(token) {
	if (!token)
		return { status: 400, error: 'Unauthorized: No token provided' };
	const revRes = await fetch('http://session-service:3000/delete', {
		method: 'DELETE',
		headers: {
			'Authorization': formattedToken,
		},
	});
	return (revRes);
}