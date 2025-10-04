// schema/schema.js

export const userSchema = {
	$id: 'userSchema',
	body: {
		type: 'object',
		required: [ 'id', 'name', 'type' ],
		properties: {
			id: { type : 'integer' },
		  	name: { type: 'string', minLength: 1 },
			type: {
				type: 'string',
				enum: [ 'guest', 'registered' ]
			},
		},
		additionalProperties: false
	}
}
