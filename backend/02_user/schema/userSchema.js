// schema/schema.js

export const userSchema = {
	$id: 'userSchema',
	body: {
		type: 'object',
		required: [ 'id', 'name', 'type', 'status' ],
		properties: {
			id: { type : 'integer' },
		  	name: { type: 'string', minLength: 1 },
			type: [ 'guest', 'registered' ],
		  	status: { type: 'string', minLength: 1 }
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
