// schema/schema.js

export const userSchema = {
	$id: 'userSchema',
	body: {
		required: [ 'id', 'name', 'type', 'status' ],
		properties: {
			id: { type : 'integer' },
		  	name: { type: 'string', minLength: 1 },
			type: {
				type: 'string',
				enum: [ 'guest', 'registered' ],
		  	},
			status: { type: 'string', minLength: 1 }
		},
		additionalProperties: false
	}
}

export const updateStatsSchema = {
	$id: 'updateStatsSchema',
	body: {
		required: [ 'p1_id', 'p1_type', 'p2_id', 'p2_type', 'winner_id' ],
		properties: {
			p1_id: { type: 'integer' },
			p1_type: {
				type: 'string',
				enum: [ 'registered', 'guest' ]
			},
			p2_id: { type: 'integer' },
			p2_type: {
				type: 'string',
				enum: [ 'registered', 'guest', 'ia' ]
			},
			winner_id: { type: 'integer' },
		},
		additionalProperties: false
	}
}