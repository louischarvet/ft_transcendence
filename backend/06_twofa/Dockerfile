FROM louischarvet/ft_transcendence_backend_base:1.0

WORKDIR /usr/src/app

RUN npm install
RUN apt-get update && apt-get upgrade -y
RUN npm install fastify fastify-plugin \
	nodemailer speakeasy dotenv \
	mailgun.js form-data
RUN npm install sqlite sqlite3
RUN apt-get install sqlite3 -y


COPY . .

CMD [ "node", "app.js" ]