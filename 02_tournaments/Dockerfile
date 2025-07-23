FROM node:24

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon

COPY . .

EXPOSE 3001
#CMD ["node", "index.js"]
CMD ["nodemon", "index.js"]
