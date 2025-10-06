//./models/user.js
import { getDB } from '../database/database.js';	

const db = await getDB();

export async function insertInTable(id, name, code){
	await db.run("INSERT INTO twofa (id, name, code) VALUES (?, ?, ?)",
		[id, name, code]);
};

export async function getFromTable(id, name){
	return await db.get('SELECT code FROM twofa  WHERE id = ? AND name = ?',
		[id, name]);
};

export async function deleteInTable(id) {
	await db.run("DELETE FROM twofa WHERE id = ?", [ id ]);
};