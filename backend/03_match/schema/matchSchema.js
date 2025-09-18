// schema/schema.js

export const registeredMatchSchema = {
	$id: 'registeredMatchSchema',
	body: {
		type: 'object',
		required: [ 'name', 'password' ],
		properties: {
			name: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 8 },
		},
		additionalProperties: false,
	},
}

export const matchSchema = {
	$id: 'matchSchema',
	body: {
		type: 'object',
		required: [ 'id', 'p1_id', 'p1_type', 'scoreP1',
			'p2_id', 'p2_type', 'scoreP2', 'winner_id', 'created_at' ],
		properties: {
			id: { type: 'integer' },
			p1_id: { type: 'integer' },
			p1_type: {
				type: 'string',
				enum: [ 'registered', 'guest' ],
			},
			scoreP1: { type: 'integer', minimum: 0 },
			p2_id: { type: 'integer' },
			p2_type: {
				type: 'string',
				enum: [ 'registered', 'guest', 'ia' ],
			},
			scoreP2: { type: 'integer', minimum: 0 },
			winner_id: { type: 'integer' },
			created_at: { type: 'integer' },
		},
		additionalProperties: false,
  	},
  	response: {
		200: {
		  	type: 'object',
		  	properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
	  		}
		}
  	}
}
