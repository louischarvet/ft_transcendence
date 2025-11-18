#!/bin/bash

mkdir -p ./ssl

if [ ! -f ./ssl/proxy.crt ] || [ ! -f ./ssl/proxy.key ]; then
    openssl req -x509 -nodes \
    -out ./ssl/proxy.crt \
    -keyout ./ssl/proxy.key \
    -subj "/C=FR/ST=NA/L=Angouleme/O=42/OU=42/CN=locharve.42.fr/UID=locharve"
fi

mkdir -p ./backend/01_reverse_proxy/ssl

if [ ! -f ./backend/01_reverse_proxy/ssl/proxy.crt ] || [ ! -f ./backend/01_reverse_proxy/ssl/proxy.key ]; then
    cp ./ssl/proxy.crt ./ssl/proxy.key ./backend/01_reverse_proxy/ssl/
fi

mkdir -p ./frontend/ssl

if [ ! -f ./frontend/ssl/proxy.crt ] || [ ! -f ./frontend/ssl/proxy.key ]; then
    cp ./ssl/proxy.crt ./ssl/proxy.key ./frontend/ssl/
fi