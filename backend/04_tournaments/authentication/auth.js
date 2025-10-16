// ./authentification.auth.js

// export async function generateJWT(user) {

// 	//! ajout 16/09/2025
// 	if (!user)
// 		return { status: 400, error: 'Bad Request: User information is incomplete' };
	
// 	const genRes = await fetch('http://session-service:3000/generate', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify(user)
// 	});
// 	console.log("######## Function GENERATEJWT --> ", genRes, "\n#######\n");
// 	return genRes;
// }

export async function authenticateJWT(request, reply) {
	const { accessToken } = request.cookies;
	if (accessToken === undefined)
		return reply.code(400).send({
			error: 'Access token missing.'
		});
    // Appel vers le session-service
    const authRes = await fetch('http://session-service:3000/authenticate', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    const data = await authRes.json();
    if (data.verified === false)
		return reply.code(400).send({ error: 'User not verified.' });
	if (data.error)
		return reply.code(authRes.status).send({ error: data.error });

	//! modifier le 17/09/2025 
    const currentuser = data ; // fallback si le service renvoie "user"
    //const currentuser = data.user || data.body.user; // fallback si le service renvoie "user"

    request.user = data;
}
