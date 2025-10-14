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
//	console.log("######## genRes\n", genRes, "#######\n");
	return genRes;
}

export async function authenticateJWT(request, reply) {

	//! ajout 16/09/2025
	//? dans le cas ou la requete n'a pas de token ou un token vide ou invalide
	if (!request.headers.authorization)
		return reply.code(401).send({ error: 'Unauthorized: No token provided' });
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
	if (data.error)
		return reply.code(401).send({ error: data.error });

    const currentuser = data.user; // fallback si le service renvoie "user"

    // if (authRes.ok === false || currentuser === undefined) {
	// 	return reply.code(401).send({ error: 'Unauthorized' });
	// }

    request.user = currentuser;
    console.log("Utilisateur attaché à la request :", request.user);
}


export async function revokeJWT(token) {

	//! ajout 16/09/2025
	if (!token)
		return { status: 401, error: 'Unauthorized: No token provided' };
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