#FROM louischarvet/ft_transcendence_backend_base:1.0
FROM node:24

EXPOSE 443

# Crée le dossier de travail
WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json pour installer les dépendances
COPY ./package*.json ./

# Installation des dépendances avant de copier le reste
RUN npm install
RUN npm install -g nodemon
#RUN npm install fastify
#RUN npm install @fastify/http-proxy @fastify/cors

# Génère les certificats SSL

RUN mkdir -p ./ssl && openssl req -x509 -nodes \
-out ./ssl/proxy.crt \
-keyout ./ssl/proxy.key \
-subj "/C=FR/ST+NA/L=Angouleme/O=42/OU=42/CN=locharve.42.fr/UID=locharve"

# Copie tout le reste (code, app.js, etc.)
COPY . .

# Lancement du serveur
CMD ["node", "--use-system-ca", "app.js"]
