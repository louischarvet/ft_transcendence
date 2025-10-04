// schema/sessionInput.js

export const generateSchema = {
	$id: 'sessionInput',
	body: {
		type: 'object',
		required: [ 'name', 'type', 'id' ],
		properties: {
			name: { type: 'string' },
			id: { type: 'integer' },
			type: {
				type: 'string',
				enum: [ 'guest', 'registered' ]
			},
			token: { type: 'string' }
		},
		additionalProperties: false
	}
}