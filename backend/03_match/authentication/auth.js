// ./authentication/auth.js

async function authenticateJWT(request, reply) {
  try {
    await request.jwtVerify(); // Le token est validé ici
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
};

export { authenticateJWT };