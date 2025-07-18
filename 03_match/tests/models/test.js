const { createMatch } = require('../../controllers/match.js');
const Match = require('../../models/match.js');

// Mock the Match model
jest.mock('../../models/match.js');

describe('Match Controller', () => {
	describe('createMatch', () => {
		it('should create and save a match', async () => {
			const matchData = {
				team1: 'Team A',
				team2: 'Team B',
				date: '2023-10-10'
			};

			// Mock the save function to resolve successfully
			Match.prototype.save = jest.fn().mockResolvedValue(matchData);

			const result = await createMatch(matchData);

			expect(Match).toHaveBeenCalledWith(matchData);
			expect(result).toEqual(matchData);
		});

		it('should throw an error if match creation fails', async () => {
			const matchData = {
				team1: 'Team A',
				team2: 'Team B',
				date: '2023-10-10'
			};

			// Mock the save function to throw an error
			Match.prototype.save = jest.fn().mockRejectedValue(new Error('Error saving match'));

			await expect(createMatch(matchData)).rejects.toThrow('Error creating match');
		});
	});
});
