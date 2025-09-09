// ./authentification.auth.js
import { getUserByName } from "../models/models.js";
//export async function Handler(request, reply){
//	const token = request.headers.Authorization;


//};

export async function generateJWT(user) {
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
    console.log("authenticateJWT");

    //const body = request.body;
    //const authHeader = request.headers.authorization;

    //if (!authHeader) 
    //    return reply.code(401).send({ error: 'Missing token' });

    //let user;

    //// Cas body vide ou sans name
    //if (!body || !body.name) {
    //    const tokenParts = authHeader.split(' ');
    //    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer')
    //        return reply.code(401).send({ error: 'Invalid token format' });

    //    const token = tokenParts[1];

    //    // Vérifie et décode le token avec fastify-jwt
    //    const payload = await request.jwtVerify(token);
    //    if (!payload)
    //        return reply.code(401).send({ error: 'Invalid token' });

    //    // Cherche l'utilisateur dans registered ou guest (payload.type)
    //    user = await getUserByName('registered', payload.name) 
    //           || await getUserByName('guest', payload.name);
    //    if (!user)
    //        return reply.code(401).send({ error: 'Unauthorized' });
    //} else {
    //    // Cas body.name présent
    //    user = await getUserByName('registered', body.name);
    //    if (!user)
    //        return reply.code(401).send({ error: 'Unauthorized' });
    //}

    //const retObj = {
    //    id: user.id,
    //    name: user.name,
    //    type: user.type,
    //    status: user.status,
    //    jwt_time: user.jwt_time
    //};

//    console.log("retObj dans authenticateJWT :", retObj);

    // Appel vers le session-service
    const authRes = await fetch('http://session-service:3000/authenticate', {
        method: 'POST',
        headers: {
            'Authorization': request.headers.authorization
        }
    });

    const data = await authRes.json();
	console.log("/// DATA\n", data);
    const currentuser = data.currentuser || data.user; // fallback si le service renvoie "user"

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