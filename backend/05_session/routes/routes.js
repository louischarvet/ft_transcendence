// routes/routes.js
import { generateSchema } from "../schema/generateSchema.js";
import { generate, authenticate, refresh, deleteToken } from '../controllers/controllers.js'

export async function sessionRoutes(fastify, options) {
/////////////////////////////////////// Accessible depuis le service twofa

    // generer access + refresh tokens
    // refresh token stocke en base de donnees
    // en cas de register ou login
    fastify.post('/generate', { schema: generateSchema }, generate);
//    fastify.post('/generate', { schema: generateSchema }, (request, reply) => {
//        return generate(fastify.jwt.sign, fastify.db, request, reply);
//    });

////////////////// Accessible depuis tous les autres services (preHandler)
    /////////////////////////////////////// Avec l'access token uniquement

    // verifier l'access token // joindre un userSchema
    // si l'access token est expire, renvoie une erreur 401
    // le front doit ensuite renvoyer une requete a /refresh
    // puis relancer la requete initiale (acces a des ressources)
    fastify.get('/authenticate', (request, reply) => {
        return authenticate(fastify.db, request, reply);
    });

////////////////////////////////// Accessibles directement par le frontend
    ///////////////////////////////////// Avec le refresh token uniquement

    // rafraichir les deux tokens, apres avoir verifie le refresh
    // supprimer l'ancien refresh et inserer le nouveau en base de donnees
    fastify.post('/refresh', (request, reply) => {
        return refresh(fastify.db, request, reply);
    });

    //////////////////////////////////// Avec access token + refresh token

    // supprime le refresh token
    // access token sur liste noire
    // en cas de logout ou de suppression de compte
    fastify.delete('/delete', (request, reply) => {
        return deleteToken(fastify.db, request, reply);
    });
}