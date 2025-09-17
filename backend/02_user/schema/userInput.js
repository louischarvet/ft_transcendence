// schema/userInput.js

export const userInput = {
	$id: 'userInput',
	body: {
		type: 'object',
		required: ['name', 'password', 'email'],
		properties: {
			name: { type: 'string', minLength: 1 },// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
			password: { type: 'string', minLength: 8 },
			email: { type: 'string', minLength: 8 } // TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
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
			name: { type: 'string', minLength: 1 },// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
			password: { type: 'string', minLength: 8 },
			toUpdate: {
				type: 'string',
				enum: [ 'name', 'picture', 'password', 'email', 'telephone' ]// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
			},
			newValue: { type: 'string' }// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
		},
		additionalProperties: false
	}
}