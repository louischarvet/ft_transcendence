#FROM transcendence_github-base_image:latest
FROM louischarvet/ft_transcendence_backend_base:1.0

EXPOSE 3000

# RUN mkdir -p /usr/src/app/
# WORKDIR /usr/src/app
# COPY ./common_tools/*.js ./
# COPY ./package.json ./package.json

#RUN npm install
#RUN npm i fastify
RUN npm install @fastify/http-proxy


# RUN apt-get install openssl -y

# nom de domaine a changer
RUN mkdir -p ./ssl && openssl req -x509 -nodes \
-out ./ssl/proxy.crt \
-keyout ./ssl/proxy.key \
-subj "/C=FR/ST+NA/L=Angouleme/O=42/OU=42/CN=locharve.42.fr/UID=locharve"

COPY ./*.js ./

CMD [ "node", "reverse_proxy.js" ]
