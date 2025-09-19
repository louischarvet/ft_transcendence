FROM node:24

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon
RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y
RUN npm install sqlite3
RUN npm install sqlite

COPY . .

EXPOSE 3003
#CMD ["node", "index.js"]
CMD ["nodemon", "index.js"]
