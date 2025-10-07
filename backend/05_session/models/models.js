// models/models.js

export async function insert(jwti, user_id) {
    await db.run(`INSERT INTO refresh(jwti, user_id) VALUES(?, ?)`,
        [ jwti, user_id ]);
}

export async function get(jwti, user_id) {
	return await db.get(`SELECT * FROM refresh WHERE jwti = ? AND user_id = ?`,
		[ jwti, user_id ]);
}

export async function erase(jwti, user_id) {
	await db.run(`DELETE FROM refresh WHERE jwti = ? AND user_id = ?`,
		[ jwti, user_id ]);
}