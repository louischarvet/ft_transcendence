// controllers/controllers.js

// POST /generate
export async function generate(request, reply) {
	const { name, type, id } = request.body;

    // Access token
    const accessToken = await request.jwtSign({
        name: name,
        type: type,
        id: id,
    },
    secret,
    { expiresIn : '30m' }
    );

    // Refresh token
    const refreshToken = await request.jwtSign({
        name: name,
        type: type,
        id: id,
    },
    secret,
    {
        expiresIn: '7d',
        jwtid: crypto.randomUUID()
    });

    // Garder en db le jwtid du refresh token
    insertRefresh(refreshToken.jwtid, id); // + exp ?

    const secureCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    };

    return reply
        .code(200)
        .setCookie('accessToken', accessToken, {
            ...secureCookieOptions,
            maxAge: 1800
        })
        .setCookie('refreshToken', refreshToken, {
            ...secureCookieOptions,
            maxAge: 604800,
            path: '/api/auth/refresh'
        })
        .send({ message: 'Access and refresh tokens generated.' });
}