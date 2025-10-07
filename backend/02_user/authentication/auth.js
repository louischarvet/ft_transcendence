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

	if (!res.ok) {
		const err = await res.json();
		return { status: res.status, error: err.error || 'Failed to generate JWT' };
	}
	console.log("######## res\n", res, "#######\n");

	const data = await res.json(); // <-- ici on récupère { token: "..." }
	return data.token;  
}

export async function authenticateJWT(request, reply) {
    console.log("####authenticateJWT");

	//! ajout 16/09/2025
	//? dans le cas ou la requete n'a pas de token ou un token vide ou invalide
	if (!request.headers.authorization)
		return reply.code(401).send({ error: 'Unauthorized: No token provided' });
    // Appel vers le session-service
    const authRes = await fetch('http://session-service:3000/authenticate', {
        method: 'POST',
        headers: {
            'Authorization': request.headers.authorization
        }
    });
	if (!authRes.ok) {
		return reply.code(authRes.status).send({ error: 'Unauthorized: Invalid token' });
	}
    const data = await authRes.json();
	if (data.error)
		return reply.code(401).send({ error: data.error });

    const currentuser = data.user || data.body.user; // fallback si le service renvoie "user"

    // if (authRes.ok === false || currentuser === undefined) {
	// 	return reply.code(401).send({ error: 'Unauthorized' });
	// }

    request.user = currentuser;
    console.log("Utilisateur attaché à la request :", request.user);
}


export async function revokeJWT(token) {

	// console.log("token int revokeJWT 02-USER  --->", token);
	//! ajout 16/09/2025
	if (!token)
		return { status: 401, error: 'Unauthorized: No token provided' };
	const formattedToken = token.startsWith('Bearer ')
		? token
		: `Bearer ${token}`;
	//console.log("//RETOBJ\n", retObj, "//END RETOBJ\n");
	const revRes = await fetch('http://session-service:3000/revoke', {
		method: 'POST',
		headers: {
			'Authorization': formattedToken,
		},
	});
	console.log("/// REVRES\n", revRes);
	return (revRes);
}