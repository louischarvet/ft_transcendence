import { checkNameFormat, isInDatabase, insertInDatabase } from '../models/user.js'

export async function checkUserExists(request, reply) {
	const { name } = request.query;

	if (!name)
		return { error: 'Name is undefined' };

	if (!checkNameFormat(name))
		return { error: 'Name format is incorrect. It must begin with an alphabetic character' };

	const exists = await isInDatabase(name);

	if (!exists){
		await insertInDatabase(name);
		return { error: 'none' };
	} else
		return { error: 'Name is already taken. Please choose another one.' };
}

export async function sayHello(request, reply) {
	return { message: "Hello from user", test: { testA: "Blob", testB: "Blub" } };
}
