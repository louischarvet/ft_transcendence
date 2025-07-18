import { Player } from '../models/players.js';
import { Pool } from '../models/tournaments.js';

const pools = [];

/* 1  tournament sera cree si un user veux rejoindre un tournoi*/
/* 2  un user rejoindra le tournoi si asser de place sinon creer un nouveau tournament*/
function createSampleData() {
  const pool1 = new Pool(1, 16);
  const pool2 = new Pool(2, 16);

  pool1.addPlayer(new Player(1, "Alice", 0));
  pool1.addPlayer(new Player(2, "Bob", 0));

  pool2.addPlayer(new Player(3, "Charlie", 0));
  pool2.addPlayer(new Player(4, "Diana", 0));

  pools.push(pool1, pool2);
}

createSampleData();

export async function getDataTournaments(request, reply) {
	return {
		message: "Bienvenue au grand Tournoi de BlackPong.\nIl n'en restera qu'un ...",
		pools: pools.map(pool =>({
			id: pool.id,
			remainingPlaces: pool.remainingPlaces,
			players: pool.getPlayers().map(player => ({
				id: player.id,
				name: player.name,
				score: player.score
			}))
		}))
	};
}
