#FROM node:20-alpine
FROM node:24

WORKDIR /app

COPY ./package.json ./package-lock.json* ./
RUN npm install

COPY . .

# Expose Vite port
EXPOSE 5173

# CMD en forme exec JSON correcte pour Alpine et Vite
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
CMD ["npm", "run", "dev", "--", "--host"]
