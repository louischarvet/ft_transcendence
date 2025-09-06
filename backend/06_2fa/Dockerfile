FROM louischarvet/ft_transcendence_backend_base:1.0

WORKDIR /usr/src/app

RUN npm install
RUN apt-get update && apt-get upgrade -y
RUN npm install fastify fastify-plugin \
	nodemailer speakeasy dotenv

COPY . .

CMD [ "node", "app.js" ]