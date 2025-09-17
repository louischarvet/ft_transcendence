// schema/schema.js

export const userSchema = {
	$id: 'userSchema',
	body: {
		type: 'object',
		required: [ 'id', 'name', 'type', 'status' ],
		properties: {
			id: { type : 'integer' },
		  	name: { type: 'string', minLength: 1 },
			type: {
				type: 'string',
				enum: [ 'guest', 'registered' ],
		  	},
			status: { 
				type: 'string',
				minLength: 1,
				enum: ['active', 'logged_out', 'pending']
				//! ajout le 16/09/2025
			}
		},
		additionalProperties: false
	}
}
