// models/models.js

import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

// Maybe elsewhere
//export async function userAndTokenMatch(token, user) {
//	//console.log("/// TOKEN\n", token, "/// USER\n", user, "\n");
//	return (token.name === user.name
//		&& token.id === user.id
//		&& token.type === user.type
//		&& token.iat >= user.jwt_time);
//}

export async function userAndTokenMatch(decoded) {
	const user = await db.get("SELECT * FROM active_tokens WHERE USER_NAME = ?", decoded.name);
	return (user.user_name === decoded.name
		&& user.user_id === decoded.id
		&& user.user_type === decoded.type
		&& user.iat === decoded.iat
		&& user.exp === decoded.exp);
}

export async function insertInActiveTokensTable(user_name, user_id, user_type, iat, exp) {
	await db.run("INSERT INTO active_tokens(user_name, user_id, user_type, iat, exp) \
		VALUES(?, ?, ?, ?, ?)", [ user_name, user_id, user_type, iat, exp ]);
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
	await db.run("DELETE FROM revoked_tokens WHERE exp <= ?", [ time ]);
}

export async function deleteInActiveTokensTable(name) {
	await db.run("DELETE FROM active_tokens WHERE user_name = ?", [ name ]);
}