FROM node:24

EXPOSE 3001

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app

COPY ./. .
COPY ./* .

RUN npm install
RUN npm i fastify
#RUN npm install --save-dev jest

CMD [ "node", "index.js" ]

