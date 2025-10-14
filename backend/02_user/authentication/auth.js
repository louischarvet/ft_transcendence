// ./authentification.auth.js
import { getUserByName } from "../models/models.js";

export async function generateJWT(user) {

	//! ajout 16/09/2025
	if (!user)
		return { status: 400, error: 'Bad Request: User information is incomplete' };
	
	const genRes = await fetch('http://session-service:3000/generate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user)
	});
	const data = await genRes.json();
//	console.log("######## genRes\n", genRes, "#######\n");
	return data;
}

export async function authenticateJWT(request, reply) {

	//! ajout 16/09/2025
	//? dans le cas ou la requete n'a pas de token ou un token vide ou invalide
	if (!request.headers.authorization)
		return reply.code(400).send({ error: 'Unauthorized: No token provided' });
    // Appel vers le session-service
    const authRes = await fetch('http://session-service:3000/authenticate', {
        method: 'GET',
        headers: {
            'Authorization': request.headers.authorization
        }
    });

    const data = await authRes.json();
	console.log("############# DATA\n", data,
				"\n##################\n");
	if (data.verified === false)
		return reply.code(400).send({ error: 'User not verified.' });
	if (data.error)
		return reply.code(authRes.status).send({ error: data.error });

    request.user = data;
    console.log("Utilisateur attaché à la request :", request.user);
}


export async function revokeJWT(token) {

	//! ajout 16/09/2025
	if (!token)
		return { status: 400, error: 'Unauthorized: No token provided' };
	//console.log("//RETOBJ\n", retObj, "//END RETOBJ\n");
	const revRes = await fetch('http://session-service:3000/delete', {
		method: 'DELETE',
		headers: {
			'Authorization': token,
		},
	});
//	console.log("/// REVRES\n", revRes);
	return (revRes);
}