FROM louischarvet/ft_transcendence_backend_base:1.0

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon
RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y
RUN npm install sqlite3
RUN npm install sqlite

RUN npm install @fastify/jwt

COPY . .

RUN cat ./database/initDatabase.sqlite | sqlite3 matches_db

EXPOSE 3000
#CMD ["node", "index.js"]
CMD ["nodemon", "app.js"]
