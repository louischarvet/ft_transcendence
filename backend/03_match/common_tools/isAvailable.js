// ./common_tools/isAvailable.js

import { getMatchByUserID } from '../models/models.js'

export async function isAvailable(request, reply) {
    const { db } = request.server;
    const user_id = request.user.id;
    if (await db.matches.get('p1_id', user_id)
        || await db.matches.get('p2_id', user_id))
        return reply.code(400).send({ error: 'User is already in a match.' });
}