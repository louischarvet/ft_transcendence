import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const dbFile = '/usr/src/app/users_db';

async function checkNameFormat(name) {
	if (/^[A-Z]$/i.test(name[0]) && /^[a-zA-Z0-9]+$/.test(name))
		return (true);
	else
		return (false);
}

async function isInDatabase(name) {
	const db = await open ({
		filename: dbFile,
		driver: sqlite3.Database
	});
	const exists = await db.get('SELECT * FROM users WHERE name = ?', [name]);
	if (exists)
		return (true);
	else
		return (false);
}

async function insertInDatabase(name) {
	const db = await open ({
		filename: dbFile,
		driver: sqlite3.Database
	});
	db.run("INSERT INTO users VALUES(?, 'available')", name);
}

async function routesPlugin(fastify, options) {
	fastify.get('/exists', async (request, reply) => {
		const queryParams = request.query;
		// try catch ?
		if (queryParams.name) {
			const userName = queryParams.name;

			const check = await (checkNameFormat(userName));

			if (check === true) {
				const isInDb = await isInDatabase(userName);

				if (isInDb === false) {
					await insertInDatabase(userName);
					return { error: 'none' };	// ?
				}
				else
					return { error: 'Name is already taken. Please choose another one.' };
			} else
				return { error: 'Name format is incorrect. It must begin with an alphabetic character' };
		} else
			return { error: 'Name is undefined' };
	})

	fastify.get('/hello', async (request, reply) => {
		return { message: "Hello from user", test: { testA: "Blob", testB: "Blub" } };
	})
}

export default routesPlugin;