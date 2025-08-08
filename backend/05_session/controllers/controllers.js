
async function generateToken(request, reply) {
//	if (await isActiveUser)
//		return error : user token already defined
	const token = await request.server.jwt.sign({
		name: request.name,
		role: request.role,
		expiresIn : '1h'
	});
}