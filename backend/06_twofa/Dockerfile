#FROM louischarvet/ft_transcendence_backend_base:1.0
FROM node:24

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install
RUN apt-get update && apt-get upgrade -y
RUN npm install fastify fastify-plugin \
	nodemailer speakeasy dotenv \
	mailgun.js form-data
RUN npm install sqlite sqlite3
RUN npm install @fastify/cookie
RUN apt-get install sqlite3 -y


COPY . .

CMD [ "node", "app.js" ]