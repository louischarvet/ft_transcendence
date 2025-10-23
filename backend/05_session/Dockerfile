#FROM louischarvet/ft_transcendence_backend_base:1.0
FROM node:24

WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/data/

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon
RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y
RUN npm install @fastify/cookie
RUN npm install @fastify/jwt
RUN npm install fastify-cron
RUN npm install @fastify/cors
RUN npm install speakeasy

COPY . .

EXPOSE 3000
CMD ["nodemon", "app.js"]