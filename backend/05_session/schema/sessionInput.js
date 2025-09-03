// schema/sessionInput.js

export const sessionInput = {
	$id: 'sessionInput',
	body: {
		type: 'object',
		required: [ 'name', 'type' ],
		properties: {
			name: { type: 'string' },
			type: {
				type: 'string',
				enum: [ 'guest', 'registered' ]
			},
			token: { type: 'string' }
		},
		additionalProperties: false
	}
}