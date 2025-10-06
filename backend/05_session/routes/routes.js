// routes/routes.js
import { generateSchema } from "../schema/generateSchema.js";

export async function sessionRoutes(fastify, options) {
/////////////////////////////////////// Accessible depuis le service twofa

    // generer access + refresh tokens
    // refresh token stocke en base de donnees
    // en cas de register ou login
    fastify.post('/generate', { schema: generateSchema }, generate);

////////////////// Accessible depuis tous les autres services (preHandler)
    /////////////////////////////////////// Avec l'access token uniquement

    // verifier l'access token // joindre un userSchema
    // si l'access token est expire, renvoie une erreur 401
    // le front doit ensuite renvoyer une requete a /refresh
    // puis relancer la requete initiale (acces a des ressources)
    fastify.get('/authenticate', authenticate);

////////////////////////////////// Accessibles directement par le frontend
    ///////////////////////////////////// Avec le refresh token uniquement

    // rafraichir les deux tokens, apres avoir verifie le refresh
    // supprimer l'ancien refresh et inserer le nouveau en base de donnees
    fastify.post('/refresh', refresh);

    //////////////////////////////////// Avec access token + refresh token

    // supprime le refresh token
    // access token sur liste noire
    // en cas de logout ou de suppression de compte
    fastify.delete('/delete', deleteToken);
}