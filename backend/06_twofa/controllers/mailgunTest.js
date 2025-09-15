import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    url: "https://api.mailgun.net"
  });
  try {
    const data = await mg.messages.create("sandboxa4f7bfb25ac24629916fcb3d2f1c0638.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxa4f7bfb25ac24629916fcb3d2f1c0638.mailgun.org>",
      to: ["Louis Charvet <louis.charvet@proton.me>"],
      subject: "Hello Louis Charvet",
      text: "Congratulations Louis Charvet, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
