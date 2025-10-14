// cron/cronFunctions.js

import { deletePendingRegistered } from "../models/models.js";

// cron pour supprimer les registered pending depuis + de 15 minutes
export async function prunePendingRegistered() {
	console.log("############# user cron\n");
	const time = Math.floor( Date.now() / 1000 ) - (15 * 60);
	await deletePendingRegistered(time);
}