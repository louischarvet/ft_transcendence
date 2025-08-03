FROM node:24

WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json* ./

RUN npm install && npm install -g nodemon
RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y
RUN npm install sqlite3
RUN npm install sqlite

COPY . .

#RUN echo "CREATE TABLE IF NOT EXISTS test_table(pipo, popi)" | sqlite3 tournament_db
#RUN echo "CREATE TABLE IF NOT EXISTS players ( \
#			id INTEGER PRIMARY KEY AUTOINCREMENT, \
#			name TEXT NOT NULL, \
#			status TEXT \
#		); \
#		CREATE TABLE IF NOT EXISTS pools ( \
#			id INTEGER PRIMARY KEY AUTOINCREMENT, \
#			remainingPlaces INTEGER NOT NULL \
#		); \
#		CREATE TABLE IF NOT EXISTS pool_players ( \
#			pool_id INTEGER, \
#			player_id INTEGER, \
#			FOREIGN KEY (pool_id) REFERENCES pools(id), \
#			FOREIGN KEY (player_id) REFERENCES players(id) \
#		);" | sqlite3 tournament_db


EXPOSE 3003
#CMD ["node", "index.js"]
CMD ["nodemon", "index.js"]
