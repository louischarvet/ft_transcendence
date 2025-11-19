#!/bin/bash

mkdir -p ./ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-out ./ssl/proxy.crt \
-keyout ./ssl/proxy.key \
-subj "/C=FR/ST=NA/L=Angouleme/O=42/OU=42/CN=locharve.42.fr/UID=locharve"

mkdir -p ./backend/01_reverse_proxy/ssl
cp ./ssl/proxy.crt ./ssl/proxy.key ./backend/01_reverse_proxy/ssl/

mkdir -p ./frontend/ssl
cp ./ssl/proxy.crt ./ssl/proxy.key ./frontend/ssl/