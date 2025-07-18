FROM node:24

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm install --save-dev jest

EXPOSE 3002

CMD ["node", "index.js"]