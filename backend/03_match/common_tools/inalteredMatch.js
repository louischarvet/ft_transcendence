// common_tools/inalteredMatch.js

import { getMatch } from '../models/models.js';

export async function inalteredMatch(request, reply) {
    const body = request.body;
    const matchID = body.id;
    const match = getMatch(matchID);

    if (match === undefined
        || body.id !== match.id
        || body.p1_id !== match.p1_id
        || body.p1_type !== match.p1_type
        || body.p2_id !== match.p2_id
        || body.p2_type !== match.p2_type
        || body.created_at !== match.created_at)
        return reply.code(403).send({ error: 'Match object is altered.' });
}