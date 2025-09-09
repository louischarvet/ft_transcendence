//./models/user.js
import { getDB } from '../database/database.js';	

const db = await getDB();

export async function insertInTable(id, code){
	await db.run("INSERT INTO twofa (id, code) VALUES (?, ?)", [id, code]);
};

export async function getFromTable(id){
	return await db.get('SELECT code FROM twofa  WHERE id = ?', [id]);
};

export async function deleteInTable(id) {
	await db.run("DELETE FROM twofa WHERE id = ?", [ id ]);
}