// ./authentication/auth.js

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
    	if (data.error)
    		return reply.code(401).send({ error: data.error });

    let currentuser;
    if (authRes.ok)
      currentuser = data.user || data.body.user;

    // if (!authRes.ok || !currentuser)
    //   return reply.code(401).send({ error: 'Unauthorized' });

    request.user = currentuser;
//    console.log("Utilisateur attaché à la request :", request.user);
}
