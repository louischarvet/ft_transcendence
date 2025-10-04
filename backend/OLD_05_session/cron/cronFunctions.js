// controllers/cronFunctions.js

import { fetchChangeStatus } from "../controllers/fetchFunctions.js";
import { deleteExpiredTokens, getExpiredTokens, deleteInActiveTokensTable } from "../models/models.js";

// cron pour supprimer les tokens revoques ~ toutes les 30 minutes
export async function pruneExpiredTokens() {
	const time = Math.floor( Date.now() / 1000 );
	await deleteExpiredTokens(time);
}

// cron pour revoquer les tokens actifs mais expires
export async function revokeExpiredTokens() {
	const time = Math.floor( Date.now() / 1000 );
	const tokens = await getExpiredTokens(time);

	for (let i = 0; i < tokens.length; i++) {
		const { user_name, user_id, user_type } = tokens[i];
	//	await insertInTable('revoked_tokens', { token: token, exp: exp });
		await deleteInActiveTokensTable(user_name);
		await fetchChangeStatus({ name: user_name, id: user_id, type: user_type }, 'logged_out');
	}
}