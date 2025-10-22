#FROM node:20-alpine
FROM node:24

WORKDIR /app

COPY ./package.json ./package-lock.json* ./
RUN npm install

#RUN apt update && apt upgrade -y
#RUN apt install openssl

RUN mkdir -p ./ssl && openssl req -x509 -nodes \
-out ./ssl/proxy.crt \
-keyout ./ssl/proxy.key \
-subj "/C=FR/ST+NA/L=Angouleme/O=42/OU=42/CN=locharve.42.fr/UID=locharve"
#RUN mkdir -p ./ssl

COPY . .

# Expose Vite port
EXPOSE 5173

# CMD en forme exec JSON correcte pour Alpine et Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

