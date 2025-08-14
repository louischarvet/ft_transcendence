// models/models.js

import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

// Maybe elsewhere
export async function userAndTokenMatch(token, user) {
	return (token.name === user.name
		&& token.id === user.id
		&& token.type === user.type
	);
}

export async function insertInTable(table, toInsert) {
	const { token, exp } = toInsert;
	await db.run("INSERT INTO " + table + "(token, exp) VALUES(?, ?)",
		[ token, exp ]);
}

export async function isInTable(table, column, value) {
	return await db.get("SELECT * FROM " + table + " WHERE " + column + " = ?",
		[ value ])
}

export async function getAllFromTable(table) {
	return await db.all("SELECT * FROM " + table);
}

export async function deleteExpiredTokens(time) {
	await db.run("DELETE FROM revoked_tokens WHERE exp <= ?", time);
}