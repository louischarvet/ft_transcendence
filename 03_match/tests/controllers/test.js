// tests/controllers/matchController.test.js
const { createMatch } = require('../../controllers/match.js');
const { Match } = require('../../models/match.js');

// On se moque du modèle
jest.mock('../../models/match.js', () => {
  return {
    Match: jest.fn().mockImplementation(() => ({
      save: jest.fn()
    }))
  };
});

describe('Match Controller', () => {
	const matchData = {
		team1: 'Team A',
		team2: 'Team B',
		date: '2023-10-10'
	};

	it('should create and save a match', async () => {
		// Mock save()
		Match.mockImplementation(() => ({
		save: jest.fn().mockResolvedValue(matchData)
		}));

		const result = await createMatch(matchData);

		expect(Match).toHaveBeenCalledWith(matchData);
		expect(result).toEqual(matchData);
	});

	it('should throw an error if match creation fails', async () => {
		Match.mockImplementation(() => ({
		save: jest.fn().mockRejectedValue(new Error('Error saving match'))
		}));

		await expect(createMatch(matchData)).rejects.toThrow('Error creating match');
	});
});
