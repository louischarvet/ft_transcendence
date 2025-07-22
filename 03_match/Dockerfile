FROM node:24

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon

COPY . .

EXPOSE 3002
CMD ["node", "index.js"]
