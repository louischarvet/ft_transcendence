// controllers/controllers.js

import { insertRefresh, getRefresh, deleteRefresh } from '../models/models.js'

const secureCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
};

async function generateAccess(name, type, id) {
    return await request.jwtSign({
        name: name,
        type: type,
        id: id,
    }, {
        expiresIn : '1m'
    });
}

async function generateRefresh(name, type, id, jwti) {
    return await request.jwtSign({
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
	const { name, type, id } = request.body;

    // Access token
    const accessToken = await generateAccess(name, type, id);
    console.log("####################### ACCESS TOKEN\n", accessToken,
                "\n####################################\n");

    // Refresh token
    const jwti = crypto.randomUUID();
    const refreshToken = await generateRefresh(name, type, id, jwti);
    console.log("###################### REFRESH TOKEN\n", refreshToken,
                "\n####################################\n");

    // Garder en db le jwtid du refresh token
    insertRefresh(jwti, id);

    return reply
        .code(200)
        .setCookie('accessToken', accessToken, {
            ...secureCookieOptions,
            maxAge: 1800
        })
        .setCookie('refreshToken', refreshToken, {
            ...secureCookieOptions,
            maxAge: 604800,
//            path: '/api/auth/refresh'
        })
        .send({ message: 'Access and refresh tokens generated.' });
}

// GET /authenticate
export async function authenticate(request, reply) {
    console.log("authenticate:\n");
    const cookies = request.cookies;
    console.log("######################### COOKIES\n", cookies,
                "\n#################################\n");
    const { accessToken } = cookies;

    if (!accessToken) {
		console.log('Missing token');
		return reply.code(400).send({ error: 'Missing token' });
	}
    try {
        const decoded = await request.jwtVerify(accessToken);
        console.log("################################ DECODED\n", ...decoded,
                    "\n########################################\n");
        return reply.code(200).send(...decoded); /////////////
    } catch (err) {
        console.log("authenticate ERROR: ", err);
        if (err.code === 'FST_JWT_EXPIRED')
            return reply.code(401).send({ error: 'Expired access token.' });
        else
            return reply.code(403).send({ error: 'Invalid access token.' });
    }
}

// POST /refresh
export async function refresh(request, reply) {
    console.log("refresh:\n");
    const cookies = request.cookies;
    console.log("######################### COOKIES\n", cookies,
                "\n#################################\n");
    const { refreshToken } = cookies;

    if (!refreshToken) {
		console.log('Missing token');
		return reply.code(400).send({ error: 'Missing token' });
	}
    try {
        const decoded = await request.jwtVerify(refreshToken);
        console.log("################################ DECODED\n", ...decoded,
                    "\n########################################\n");

        if (!await getRefresh(decoded.jwti, decoded.id)) // must delog
            return reply.code(403).send({ error: 'Obsolete refresh token.' });

        const { name, type, id, jwti } = decoded;

        // New access token
        const newAccess = generateAccess(name, type, id);

        // New refresh token
        const newJwti = crypto.randomUUID();
        const newRefresh = generateRefresh(name, type, id, newJwti);
        // mise a jour db
        deleteRefresh(jwti, id);
        insertRefresh(newJwti, id);

        return reply
            .code(200)
            .setCookie('accessToken', newAccess, {
                ...secureCookieOptions,
                maxAge: 1800
            })
            .setCookie('refreshToken', newRefresh, {
                ...secureCookieOptions,
                maxAge: 604800,
                path: '/api/auth/refresh'
            })
            .send({ message: 'Tokens have been refreshed.' });
    } catch (err) {
        console.log("refresh ERROR: ", err);
        if (err.code === 'FST_JWT_EXPIRED') // must relog
            return reply.code(401).send({ error: 'Expired refresh token.' });
        else // must relog
            return reply.code(403).send({ error: 'Invalid refresh token.' });
    }
}

// DELETE /delete
export async function deleteToken(request, reply) {
    console.log("delete:\n");
    const cookies = request.cookies;
    console.log("######################### COOKIES\n", cookies,
                "\n#################################\n");
    const { refreshToken } = cookies;
    try {
        const decoded = request.jwtVerify(refreshToken);
        console.log("################################ DECODED\n", ...decoded,
                    "\n########################################\n");

        if (!await getRefresh(decoded.jwti, decoded.id)) // must delog
            return reply.code(403).send({ error: 'Obsolete refresh token.' });

        const { id, jwti } = decoded;
        await deleteRefresh(jwti, id);
        return reply.code(200).send({ message: 'Deleted refresh token.' })
    } catch (err) {
        console.log("delete ERROR: ", err);
        if (err.code === 'FST_JWT_EXPIRED') // must relog
            return reply.code(401).send({ error: 'Expired refresh token.' });
        else // must relog
            return reply.code(403).send({ error: 'Invalid refresh token.' });
    }
}