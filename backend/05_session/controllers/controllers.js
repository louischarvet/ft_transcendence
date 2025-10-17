// controllers/controllers.js

//import { insertRefresh, getRefresh, deleteRefresh } from '../models/models.js'

const secureCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
};

async function clearCookies(reply) {
	reply.clearCookie('accessToken')
//		.clearCookie('2fa')
		.clearCookie('refreshToken');
}

async function generateAccess(sign, name, type, id, jwti, verified) {
    return await sign({
        name: name,
        type: type,
        id: id,
        jwti: jwti,
        verified: verified
    }, {
        expiresIn : '15m'
    });
}

async function generateRefresh(sign, name, type, id, jwti) {
    return await sign({
        name: name,
        type: type,
        id: id,
        jwti: jwti
    }, {
        expiresIn: '7d',
    });
}

// POST /generate
export async function generate(request, reply) {
    const { server } = request;
	const { name, type, id, verified } = request.body;
    const jwti = crypto.randomUUID();

    // Access token
    const accessToken = await generateAccess(server.jwt.sign, name, type, id, jwti, verified);

    let message, refreshToken;
    if (verified === true) {
        // Refresh token
        refreshToken = await generateRefresh(server.jwt.sign, name, type, id, jwti);

        // Garder en db le jwtid du refresh token
        server.db.refresh.insert(jwti, id);
        message = 'Access and refresh tokens generated.';
    } else
        message = 'Access token generated. Waiting 2fa.'

    return reply
        .code(200)
        .send({
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: message
        });
}

// GET /authenticate
export async function authenticate(db, request, reply) {
    const rawToken = request.headers.authorization;
    if (rawToken === undefined || rawToken.split(' ')[0] !== 'Bearer')
        return reply.code(400).send({ error: 'Missing Bearer' });
    const accessToken = rawToken.split(' ')[1];

    if (!accessToken) {
		console.log('Missing token');
		return reply.code(400).send({ error: 'Missing token' });
	}
    try {
        const decoded = await request.jwtVerify(accessToken);

        const revoked = await db.revokedAccess.get(decoded.jwti);
        if (revoked !== undefined)
            return reply.code(400).send({ error: 'Access token is revoked.' }); // 403 ?

        delete decoded.iat;
        delete decoded.exp;

        return reply.code(200).send(decoded); /////////////
    } catch (err) {
        console.log("authenticate ERROR: ", err);
        if (err.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED')
            return reply.code(401).send({ error: 'Expired access token.' });
        else
            return reply.code(401).send({ error: 'Invalid access token.' }); // 403 ?
    }
}

// POST /refresh
export async function refresh(db, request, reply) {
    const { refreshToken } = request.cookies;
    if (refreshToken === undefined)
        return reply.code(400).send({ error: 'Missing token' });

    const { server } = request;

    clearCookies(reply);
    try {
        const decoded = await request.jwtVerify(refreshToken);

        if (!await db.refresh.get(decoded.jwti, decoded.id)) // must delog
            return reply.code(403).send({ error: 'Obsolete refresh token.' });

        const { name, type, id, jwti } = decoded;
        const newJwti = crypto.randomUUID();

        // New access token
        const newAccess = await generateAccess(server.jwt.sign, name, type, id, newJwti, true);

        // New refresh token
        const newRefresh = await generateRefresh(server.jwt.sign, name, type, id, newJwti);
        // mise a jour db
        db.refresh.erase(jwti, id);
        db.refresh.insert(newJwti, id);

        return reply
            .code(200)
            .setCookie('accessToken', newAccess, {
                ...secureCookieOptions,
                maxAge: 1800,
                path: '/'
            })
            .setCookie('refreshToken', newRefresh, {
                ...secureCookieOptions,
                maxAge: 604800,
                path: '/session/refresh'
            })
            .send({ message: 'Tokens have been refreshed.' });
    } catch (err) {
        if (err.code === 'FST_JWT_EXPIRED') // bad code !!!
            return reply.code(403).send({ error: 'Expired refresh token.' });
        else // must relog
            return reply.code(403).send({ error: 'Invalid refresh token.' }); // 403 ?
    }
}

// DELETE /delete
export async function deleteToken(db, request, reply) {
    const rawToken = request.headers.authorization;
    if (rawToken === undefined || rawToken.split(' ')[0] !== 'Bearer')
        return reply.code(400).send({ error: 'Missing Bearer' });
    const accessToken = rawToken.split(' ')[1];

    try {
        const decodedAccess = await request.jwtVerify(accessToken);

        const { id, jwti, exp } = decodedAccess;
        const refreshRef = await db.refresh.get(jwti, id);

        if (refreshRef === undefined)
            return reply.code(403).send({
    //            ...decoded,
                error: 'deleteToken: Obsolete refresh token.'
            });

        await db.refresh.erase(jwti, id);
        // revoke access !
        await db.revokedAccess.insert(jwti, exp);

        return reply.code(200).send({ message: 'Deleted refresh token.' })
    } catch (err) {
        console.log("delete ERROR: ", err);
        if (err.code === 'FST_JWT_EXPIRED') // must relog
            return reply.code(401).send({ error: 'Expired access token.' });
        else // must relog
            return reply.code(401).send({ error: 'Invalid access token.' }); // 403 ?
    }
}