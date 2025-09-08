// controllers/controllers.js

// import nodemailer from 'nodemailer';
import Formdata from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0
import { config } from 'dotenv';
import speakeasy from 'speakeasy';

import { sendSimpleMessage } from './mailgunTest.js';

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
	const mailgun = new Mailgun(Formdata);
	const mg = mailgun.client({
		username: "api",
		key: process.env.API_KEY,
		url: "https://api.mailgun.net"
	});

	try {
		const data = await mg.messages.create(process.env.MG_DMN, {
			from: "Mailgun Sandbox <postmaster@" + process.env.MG_DMN + ">", //
			to: [name + "<" + email + ">"],
			subject: "42 ft_transcendence 2FA",
			text: "Hello " + name + ",\n\nPlease verify your email with this code : \n"
				+ code + "\nThank you !\n\n42 ft_transcendence team",
		})
		console.log(data);
	} catch (error) {
		console.log(error);
	}
}

// Route POST pour verifier l'email
export async function verifyMail(request, reply) {
	const { name, email } = request.body;
	const code = await generateCode();

	await sendMail(name, email, code);
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
