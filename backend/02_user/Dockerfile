FROM louischarvet/ft_transcendence_backend_base:1.0

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon
RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y
RUN npm install @fastify/jwt
RUN npm install fastify-cron
# helmet pour proteger contre attaques XSS
# RUN npm install @fastify/helmet
RUN npm install bcrypt

COPY . .

#! ajout 16/09/2025
#? supp ligne suivante on initialise db dans app.js
#RUN cat ./database/initDatabase.sqlite | sqlite3 users_db

EXPOSE 3000
#CMD ["node", "index.js"]
CMD ["nodemon", "app.js"]
