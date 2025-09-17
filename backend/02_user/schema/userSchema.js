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
