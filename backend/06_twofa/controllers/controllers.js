// controllers/controllers.js

import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import speakeasy from 'speakeasy';
import { insertInTable, getFromTable, deleteInTable } from '../models/models.js';
import { generateJWT, revokeJWT } from '../authentication/auth.js';

config();

const secureCookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'Strict' //?
};

// Generation de clef secrete
const secret = speakeasy.generateSecret({ length: 20 });

async function clearCookies(reply) {
	reply.clearCookie('accessToken')
//		.clearCookie('2fa')
		.clearCookie('refreshToken');
}


// Generation du code (one time password)
async function generateCode() {
	return (await speakeasy.totp({
		secret: secret.base32,
		encoding: 'base32'
	}));
}

// Envoyer le mail
async function sendMail(name, email, code) {
	// console.log("##### USR_ADDR = ", process.env.USR_ADDR,
	// 			"\n##### APP_PASS = ", process.env.APP_PASS
	// );
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.USR_ADDR,
			pass: process.env.APP_PASS
		}
	});

//	await transporter.verify((error, success) => {
//    if (error) {
//        console.log("Erreur de connexion au serveur SMTP :", error);
//    } else {
//        console.log("Serveur SMTP prêt à envoyer des e-mails");
//    }
//	});
	console.log("email: ", email);
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

	const res = await generateJWT({
		id: id,
		type: 'registered',
		name: name,
		verified: false
	});
	const jsonRes = await res.json();
	const { accessToken } = jsonRes;

	await clearCookies(reply);

	return reply.code(200)
//		.setCookie('accessToken', accessToken, {
//			...secureCookieOptions,
//			maxAge: 1800
//		})
		.send({
			message: 'Pending 2fa verification.',
			accessToken: accessToken
		});
}

// Route POST pour verifier le code généré
export async function verifyCode(request, reply) {
	const { code, id, name, type } = request.user;
	const codeToCompare = await getFromTable(id, name);
	if (codeToCompare === undefined)
		return reply.code(400).send({ error: 'Unauthorized (verifyCode)' });

//////////////////////////// DECOMMENTER POUR ACTIVER LE 2FA !!!!!!
//	if (code !== codeToCompare.code)
//		return reply.code(400).send({error : 'bad code. Retry !'});
///////////////////////////////////////////////////////////////////

	// revocation de l'ancien accessToken
	await revokeJWT(request.headers.authorization);

	clearCookies(reply);

	// si user n'est pas le p2 d'un match
//	if (tmp === undefined || !tmp) {
		const response = await generateJWT({ 
				id: id,
				type: 'registered',
				name: name,
				verified: true
		});
		const jsonRes = await response.json();
		const { accessToken, refreshToken } = jsonRes;
		
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
		reply.setCookie('accessToken', accessToken, {
			...secureCookieOptions,
			maxAge: 1800
		})
		.setCookie('refreshToken', refreshToken, {
			...secureCookieOptions,
			maxAge: 604800,
//			path: '/api/session/refresh'
		});
//	}
	
	await deleteInTable(id);

	return reply.code(201)
		.send({
			//token: token,
			message: 'User ' + name + ' verified'
		}
	);
}
