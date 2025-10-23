#FROM louischarvet/ft_transcendence_backend_base:1.0
FROM node:24

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

# mettre node apres
RUN npm install && npm install -g nodemon


RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y

RUN npm install fastify-cron
RUN npm install @fastify/cookie
# helmet pour proteger contre attaques XSS
# RUN npm install @fastify/helmet
RUN npm install bcrypt
RUN npm install speakeasy

COPY . .
RUN mkdir ./data/

EXPOSE 3000
#CMD ["node", "index.js"]
CMD ["nodemon", "app.js"]
