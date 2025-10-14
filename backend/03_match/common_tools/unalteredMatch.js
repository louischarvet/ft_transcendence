// common_tools/unalteredMatch.js

import { getMatch } from '../models/models.js';

export async function unalteredMatch(request, reply) {
    const body = request.body;
    const matchID = body.id;
    const match = await getMatch(matchID);
	
    console.log("/////////////////////////////// BODY\n", body,
                "////////////////////////////////////\n",
                "////////////////////////////// MATCH\n", match,
                "////////////////////////////////////\n");

    if (match === undefined
        || body.id !== match.id
        || body.p1_id !== match.p1_id
        || body.p1_type !== match.p1_type
        || body.p2_id !== match.p2_id
        || body.p2_type !== match.p2_type
        || body.created_at !== match.created_at
		|| (body.tournament_id !== undefined && body.tournament_id !== match.tournament_id))
        return reply.code(400).send({ error: 'Match object is altered.' });
}