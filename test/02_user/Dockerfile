#FROM node:24
FROM louischarvet/ft_transcendence_backend_base:1.0

EXPOSE 3001

# RUN mkdir -p /usr/src/app/
# sWORKDIR /usr/src/app

# COPY ./package.json ./package.json

# RUN npm install
# RUN npm i fastify

# RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y
RUN npm install sqlite3
RUN npm install sqlite

RUN echo "CREATE TABLE IF NOT EXISTS users(name, state)" | sqlite3 users_db
RUN echo "INSERT INTO users VALUES('pipo', 'available')" | sqlite3 users_db

# COPY ./common_tools/*.js ./
COPY ./*.js ./

CMD [ "node", "user.js" ]
