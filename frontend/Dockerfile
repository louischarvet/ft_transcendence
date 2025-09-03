FROM node:20-alpine

WORKDIR /app

# RUN apt update && apt install bash -y

COPY package.json ./
RUN npm install

COPY . .
CMD ["npm", "run", "dev", "--", "--host"]