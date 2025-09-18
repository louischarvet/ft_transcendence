// ./common_tools/isAvailable.js

import { getMatchByUserID } from '../models/models.js'

export async function isAvailable(request, reply) {
    if (await getMatchByUserID(request.user.id))
        return reply.code(403).send({ error: 'User is already in a match.' });
}