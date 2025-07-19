FROM node:24

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install --save-dev jest

COPY . .

EXPOSE 3002

CMD ["node", "index.js"]
