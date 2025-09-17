// schema/schema.js

export const matchSchema = {
	$id: 'matchSchema',
	body: {
		type: 'object',
		required: ['match_type'],
		properties: {
			match_type: { 
				type: 'string', 
				enum: ['guest', 'registered', 'ia'] 
			},
			player2: {
				type: 'object',
				properties: {
					name: { type: 'string', minLength: 1 },
					email: { type: 'string', minLength: 3 },
					password: { type: 'string', minLength: 8 },
				}
			}
		},
		additionalProperties: false
  	},
  	response: {
		200: {
		  	type: 'object',
		  	properties: {
				success: { type: 'boolean' },
				userId: { type: 'string' }
	  		}
		}
  	}
}

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

export const matchUpdateSchema = {
	$id: 'matchUpdateSchema',
	body: {
		type: 'object',
		required: ['scoreP1', 'scoreP2'],
		properties: {
			scoreP1: { type: 'integer', minimum: 0 },
			scoreP2: { type: 'integer', minimum: 0 },
			winner_id: { type: 'string' }
		},
		additionalProperties: false
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

export const userSchema = {
	$id: 'userSchema',
	body: {
		type: 'object',
		required: ['name'],
		properties: {
			name: { type: 'string', minLength: 1 }
		},
		additionalProperties: false
  	}
}