// ./authentification.auth.js
import { getUserByName } from "../models/models.js";

export async function generateJWT(user) {
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
    console.log("authenticateJWT");

    // Appel vers le session-service
    const authRes = await fetch('http://session-service:3000/authenticate', {
        method: 'POST',
        headers: {
            'Authorization': request.headers.authorization
        }
    });


    const data = await authRes.json();
//	console.log("/// DATA\n", data);
    const currentuser = data.user || data.body.user; // fallback si le service renvoie "user"

    if (!authRes.ok || !currentuser)
        return reply.code(401).send({ error: 'Unauthorized' });

    request.user = currentuser;
    console.log("Utilisateur attaché à la request :", request.user);
}


export async function revokeJWT(token) {
	//console.log("//RETOBJ\n", retObj, "//END RETOBJ\n");
	const revRes = await fetch('http://session-service:3000/revoke', {
		method: 'POST',
		headers: {
			'Authorization': token,
		},
	});
	console.log("/// REVRES\n", revRes);
	return (revRes);
}