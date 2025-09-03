// schema/schema.js

export const userSchema = {
	$id: 'userSchema',
	body: {
		type: 'object',
		required: [ 'id', 'name', 'type', 'status', 'jwt_time' ],
		properties: {
			id: { type : 'integer' },
		  	name: { type: 'string', minLength: 1 },
			type: {
				type: 'string',
				enum: [ 'guest', 'registered' ]
			},
			status: { type: 'string', minLength: 1 },
			jwt_time: { type: 'integer' }
		},
		additionalProperties: false
	}
}
