// schema/sessionInput.js

export const sessionInput = {
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

export const replaceSchema = {
	$id: 'replaceSchema',
	body: {
		required: [ 'token' ],
		properties: {
			token: { type: 'string' }
		},
		additionalProperties: false
	}
}