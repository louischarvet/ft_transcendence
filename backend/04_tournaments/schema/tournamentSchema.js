// schema/tournamentSchema.js

// ajout le 19/09/2025
export const tournamentSchema = {
	$id: 'tournamentSchema',
	body: {
		type: 'object',
		required: ['nbPlayers'],
		properties: {
			nbPlayers: {
				type: 'integer',
				enum: [4, 8, 16],
			},
		},
		additionalProperties: false
	}
}

export const nextSchema = {
	$id: 'nextSchema',
	body: {
		type: 'object',
		required: [ 'tournamentID', 'matchID', 'player1', 'player2', 'scoreP1', 'scoreP2' ],
		properties: {
			tournamentID: { type: 'integer' },
			matchID: { type: 'integer' },
			player1: {
				id: { type: 'integer'},
				type: {
					type: 'string',
					enum: [ 'registered', 'guest', 'ia' ],
				},
				name: 'string',
			},
			player2: {
				id: { type: 'integer'},
				type: {
					type: 'string',
					enum: [ 'registered', 'guest', 'ia' ],
				},
				name: 'string',
			},
			scoreP1: { type: 'integer' },
			scoreP2: { type: 'integer' },
		},
		additionalProperties: false,
	}
}