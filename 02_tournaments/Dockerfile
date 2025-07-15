FROM node:24

EXPOSE 3001

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app

COPY ./*.js ./
COPY ./common_tools/*.js ./
COPY ./package.json ./package.json

RUN npm install
RUN npm i fastify

CMD [ "node", "user.js" ]
