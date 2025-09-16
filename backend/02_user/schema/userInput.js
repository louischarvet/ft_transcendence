// schema/userInput.js

export const userInput = {
	$id: 'userInput',
	body: {
		type: 'object',
		required: ['name', 'password', 'email'],
		properties: {
			name: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 8 },
			email: { type: 'string', minLength: 8 }, // TODO parsing mail
			tmp : { type: 'boolean' } // facultatif, true si user est P2 pour un match
		},
		additionalProperties: false
	}
}

export const updateSchema = {
	$id: 'updateSchema',
	body: {
		type: 'object',
		required: [ 'name', 'password' , 'toUpdate', 'newValue' ],
		properties: {
			name: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 8 },
			toUpdate: {
				type: 'string',
				enum: [ 'name', 'picture', 'password', 'email', 'telephone' ]
			},
			newValue: { type: 'string' }
		},
		additionalProperties: false
	}
}