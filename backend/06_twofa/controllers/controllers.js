// controllers/controllers.js

import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import speakeasy from 'speakeasy';
import { insertInTable, getFromTable, deleteInTable } from '../models/models.js';
import { sendSimpleMessage } from './mailgunTest.js';
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

//async function sendMail(name, email, code) {
//	const mailgun = new Mailgun(Formdata);
//	const mg = mailgun.client({
//		username: "api",
//		key: process.env.API_KEY,
//		url: "https://api.mailgun.net"
//	});

//	try {
//		const data = await mg.messages.create(process.env.MG_DMN, {
//			from: "Mailgun Sandbox <postmaster@" + process.env.MG_DMN + ">", //
//			to: [name + "<" + email + ">"],
//			subject: "42 ft_transcendence 2FA",
//			text: "Hello " + name + ",\n\nPlease verify your email with this code : \n"
//				+ code + "\nThank you !\n\n42 ft_transcendence team",
//		})
//		console.log(data);
//	} catch (error) {
//		console.log(error);
//	}
//}

// Route POST pour verifier l'email
export async function sendCode(request, reply) {
	const { name, email, id } = request.body;
	const code = await generateCode();

	await sendMail(name, email, code);
	await insertInTable(id, code);
}

// Route POST pour verifier le code généré
export async function verifyCode(request, reply) {
	// console.log("################################# REQUEST VERIFYCODE\n",
	// 	request.headers, "####################################################\n"
	// );
	const { code, id, name, type } = request.body;
	const codeToCompare = await getFromTable(id);
	if (codeToCompare === undefined)
		return reply.code(401).send({ error: 'Unauthorized (verifyCode)' });
	console.log("\t/// body verifiCode \n", request.body);
	console.log("\t/// codeToCompare and code\n", codeToCompare, code);
	if (code !== codeToCompare.code)
		return reply.code(401).send({error : 'bad code. Retry !'});
	const response = await generateJWT({ 
			id: id,
			type: 'registered',
			name: name
	});
	const jsonRes = await response.json();
	const token = jsonRes.token;
	await deleteInTable(id);

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

	return reply.code(201).send({
		token,
		message: 'User verified'
	});
}

// const testAccount = await nodemailer.createTestAccount();
// console.log("///// TestAccount\nuser: ", testAccount.user, "\npass: ", testAccount.pass);
// // Test avec variables d'environnement
// const testSender = await nodemailer.createTransport({
// 	host: process.env.SMTP_HOST,
// 	port: process.env.SMTP_PORT,
// 	secure: false,
// 	auth: {
// 		user: testAccount.user,
// 		pass: testAccount.pass,
// 	},
// });


// export async function sendMail(request, reply) {
// 	console.log("///// TESTSENDER\n", testSender);

// 	const info = await testSender.sendMail({
// 		from: `"2FA Service" <` + testAccount.user + `>`,
// 		to: `louischarvet@icloud.com`,
// 		subject: `This is a test`,
// 		text: `Hello.`,
// 	});
// 	console.log('Message sent: %s', info.messageId);
//     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
// 	return reply.code(200).send({ message: `Mail successfully sent.` });
// }

// Test avec mailgun
export async function mailgun(request, reply) {
//	const { name, email } = request.body;
	sendSimpleMessage();
}
