// controllers/controllers.js

import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import speakeasy from 'speakeasy';
import { insertInTable, getFromTable, deleteInTable } from '../models/models.js';
import { generateJWT } from '../authentication/auth.js';

config();

// Generation de clef secrete
const secret = speakeasy.generateSecret({ length: 20 });

// Generation du code (one time password)
async function generateCode() {
	return (await speakeasy.totp({
		secret: secret.base32,
		encoding: 'base32'
	}));
}

// Envoyer le mail
async function sendMail(name, email, code) {
	console.log("##### USR_ADDR = ", process.env.USR_ADDR,
				"\n##### APP_PASS = ", process.env.APP_PASS
	);
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.USR_ADDR,
			pass: process.env.APP_PASS
		}
	});

	await transporter.sendMail({
		from: `"2FA Service" <` + process.env.USR_ADDR + `>`,
 		to: email,
 		subject: `2FA authentification ft_transcendence`,
 		text: `Hello ` + name
			+ ",\nPlease enter the code below to achieve your sigin:\n" + code
			+ "\n\nThank you and see you soon on ft_transcendence !"
 	});
}

// Route POST pour verifier l'email
export async function sendCode(request, reply) {
	const { name, email, id } = request.body;
	const code = await generateCode();

	await sendMail(name, email, code);
	console.log("##### sendCode after sendMail\n");
	await insertInTable(id, name, code);
	console.log("##### sendCode after insertInTable\n");

}

// Route POST pour verifier le code généré
export async function verifyCode(request, reply) {
	const { code, id, name, type, tmp } = request.body;
	const codeToCompare = await getFromTable(id, name);
	if (codeToCompare === undefined)
		return reply.code(401).send({ error: 'Unauthorized (verifyCode)' });

//////////////////////////// DECOMMENTER POUR ACTIVER LE 2FA !!!!!!
	if (code !== codeToCompare.code)
		return reply.code(401).send({error : 'bad code. Retry !'});
///////////////////////////////////////////////////////////////////

	// si user n'est pas le p2 d'un match
	let token;
	if (tmp === undefined || !tmp) {
		const response = await generateJWT({ 
				id: id,
				type: 'registered',
				name: name
		});
		const jsonRes = await response.json();
		token = jsonRes.token;
		
		// Changer le status dans user-service: pending -> available
		await fetch('http://user-service:3000/changestatus', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: name,
				id: id,
				status: 'available',
				type: type
			}),
		});
	}
	
	await deleteInTable(id);

	return reply.code(201).send({
		token: token,
		message: 'User ' + name + ' verified',
		tmp: tmp,
	});
}
