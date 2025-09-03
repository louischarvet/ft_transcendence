import { Match } from '../../models/match.js';

describe('Match Model', () => {
	let db;

	beforeAll(async () => {
		const sqlite = await import('sqlite');
		const sqlite3Module = await import('sqlite3');
		const sqlite3 = sqlite3Module.default || sqlite3Module;

		db = await sqlite.open({
			filename: './mydatabase.db',
			driver: sqlite3.Database
		});

		await Match.initializeDatabase();
	});

	afterEach(async () => {
		await db.run('DELETE FROM matches');
	});

	test('✅ createMatch should insert and return match with id', async () => {
		const match = await Match.createMatch(1, 'Alice', 'Bob');
		expect(match).toHaveProperty('id');
		expect(match.poolId).toBe(1);
		expect(match.player1).toBe('Alice');
		expect(match.player2).toBe('Bob');

		// Vérifie en base
		const row = await db.get('SELECT * FROM matches WHERE id = ?', match.id);
		expect(row).not.toBeUndefined();
		expect(row.poolId).toBe(1);
		expect(row.player1).toBe('Alice');
		expect(row.player2).toBe('Bob');
	});

	test('✅ initializeDatabase should create the matches table', async () => {
		const tableInfo = await db.all("PRAGMA table_info('matches')");
		expect(tableInfo.some(col => col.name === 'poolId')).toBe(true);
		expect(tableInfo.some(col => col.name === 'player1')).toBe(true);
		expect(tableInfo.some(col => col.name === 'player2')).toBe(true);
	});
});
