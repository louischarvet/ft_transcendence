# Utiliser Node.js 20 Alpine pour résoudre le problème crypto.hash
FROM node:20-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    wget \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier tous les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY tailwind.config.js ./

# Installer les dépendances
RUN npm ci && npm cache clean --force

# Copier le code source
#COPY src/ ./src/
#COPY public/ ./public/
COPY . .
# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer les permissions
RUN chown -R nextjs:nodejs /usr/src/app
USER nextjs

# Exposer le port
EXPOSE 5173

# Variables d'environnement
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=5173

# Commande de démarrage avec hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"] 