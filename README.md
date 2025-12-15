# ft_transcendence
## Final project of 42 School Common Core
### by: bdany, locharve, natrijau, yanolive

In order to launch this project, you will need to **include a .env file** in the 2fa service directory (backend/06_twofa/.env). The following variables must be defined: \
USR_ADDR : gmail adress from which verification mails will be sent \
APP_PASS : password to use gmail with apps

You can access the website via https://localhost:5173. Here you will be able to create an account (or continue as guest if you prefer, **in which case your data will be erased when you log out**).

After that, you can play Pong against an AI or another player (who will be able to log in temporarily, or play as a guest). Multiplayer is **local only**, i.e. the two players play on the same keyboard (W-S for player 1, UP-DOWN for player 2). Tournament with 4, 8 or 16 players is also possible.

Your stats will be updated at the end of a game, and can be seen at the profile tab. Here you can also update your profile picture, your email adress, your password, and delete your account.

You can also play BlackJack. If you run out of money (your profile starts with 500 wallet), you can earn some by playing Pong.

We validated the project with the following modules:\
Backend\
Server-side Pong\
Micro-services architecture\
Frontend\
AI\
3D\
Second game\
2FA and JWT\
User management

## Backend documentation

### 1. reverse_proxy
- Serves the other services
- HTTPS
- SSL/TLS

### 2. user
- Registration, user infos
- Password hash and verification
- Game stats

### 3. match
- Matches creation and management
- Game results
- Matches history

### 4. tournament
- Tournament creation and management
- Communicates with match service to create each match
- Players management
- Tournament results and history

### 5. session
- Generates JWT to authentify the user (access and refresh)
- Access token (exp 15min) joined in every request
- Pending twofa, a temporary access token is generated
- If the access token, refresh token (exp 7d) is joined to generate new tokens (both)
- Verifies the JWT (called by each service)
- Deletes the JWT (stored in database, considered as revoked. When expiration comes, the token is deleted)

### 6. twofa
- Generates a code
- Sends email with the code to verify the user's account
- The code is sent by the user, and verified

### 7. pong
- Websocket
- All server-side Pong logic

### 8. blackjack
- Websocket
- All server-side blackjack logic