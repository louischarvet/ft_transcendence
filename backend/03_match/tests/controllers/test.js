// Import nécessaire pour Jest avec ESM
import { jest } from '@jest/globals';

// 🧪 On simule le module 'models/match.js'
jest.unstable_mockModule('../../models/match.js', () => ({
  Match: {
    createMatch: jest.fn().mockResolvedValue({
      id: 1,
      poolId: 101,
      player1: 'Alice',
      player2: 'Bob'
    }),
    dbPromise: Promise.resolve({
      get: jest.fn((query, params, cb) => {
        cb(null, {
          id: 1,
          poolId: 101,
          player1: 'Alice',
          player2: 'Bob'
        });
      })
    })
  }
}));

// ⬇️ Chargement dynamique du module à tester
const { addMatch, getNextMatch } = await import('../../controllers/match.js');

describe('Match Controller (ESM)', () => {
  it('✅ addMatch should return created match', async () => {
    const matchData = {
      poolId: 101,
      player1: 'Alice',
      player2: 'Bob'
    };

    const result = await addMatch(matchData);

    expect(result).toEqual({
      id: 1,
      poolId: 101,
      player1: 'Alice',
      player2: 'Bob'
    });
  });

  it('✅ getNextMatch should return the first match in DB', async () => {
    const result = await getNextMatch();

    expect(result).toEqual({
      id: 1,
      poolId: 101,
      player1: 'Alice',
      player2: 'Bob'
    });
  });
});
