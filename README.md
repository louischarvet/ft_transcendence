# 42 ft_transcendence Backend

Dev : Pour modifier un micro-service, utiliser la branche correspondant a ce micro-service. Si elle n'existe pas, la creer. 
Sur cette branche, modifier UNIQUEMENT ce micro-service.


## Architecture des Micro-services

### 1. Proxy Service (Port 3000)
- Reverse proxy HTTPS
- Gestion des routes vers les autres services
- SSL/TLS

### 2. User Service (Port 3001)
- Gestion des utilisateurs
- Authentification (username)
- Status des joueurs

### 3. Match Service (Port 3002)
- Création/gestion des matchs
- Scores et résultats
- Historique des parties (table -> match_results)

### 4. Tournament Service (Port 3003)
- Création/gestion des tournois
- Status des tournois
- Brackets/éliminations
- Classements

## Comment lancer le projet

# Installation
```bash
make 
```
# Développement
- voir Makefile pour plus de renseignements

# Tests
- voir Makefile pour plus de renseignements


## API Documentation

### User Service
- GET /user/users - Liste des utilisateurs
- POST /user/users - Création d'utilisateur
- voir /routes/
...

### Match Service
- POST /match/matches - Création d'un match
- PATCH /match/matches/:id/result - Mise à jour score
- voir /routes/
...

### Tournament Service
- GET /tournament/data_tournaments - Liste des tournois
- POST /tournament/next_match - Prochain match
- voir /routes/
...

