// models/models.js

import { getDB } from '../common_tools/getDB.js';	

const db = await getDB();

export async function insertInTable(table, toInsert) {
	const { token, exp } = toInsert;
	await db.run("INSERT INTO " + table + "(token, exp) VALUES(?, ?)",
		[ token, exp ]);
}

export async function isInTable(table, column, value) {
	return await db.get("SELECT * FROM " + table + " WHERE " + column + " = ?",
		[ value ])
}