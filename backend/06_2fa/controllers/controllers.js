// controllers/controllers.js

import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import speakeasy from 'speakeasy';

config();

const testAccount = await nodemailer.createTestAccount();
console.log("///// TestAccount\nuser: ", testAccount.user, "\npass: ", testAccount.pass);
// Test avec variables d'environnement
const testSender = await nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: testAccount.user,
		pass: testAccount.pass,
	},
});


export async function sendMail(request, reply) {
//	console.log("///// TESTSENDER\n", testSender);

	const info = await testSender.sendMail({
		from: `"2FA Service" <` + testAccount.user + `>`,
		to: `louischarvet@icloud.com`,
		subject: `This is a test`,
		text: `Hello.`,
	});
	console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	return reply.code(200).send({ message: `Mail successfully sent.` });
}