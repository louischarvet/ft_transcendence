// schema/userInput.js

// modifier le 18/09/2025
export const userInput = {
	$id: 'userInput',
	body: {
		type: 'object',
		required: ['name', 'password', 'email'],
		properties: {
			name: {
				type: 'string',
				minLength: 1,
				maxLength: 64,
				pattern: '^[^<>{}"\'`]*$'
			},
			password: {
				type: 'string',
				minLength: 8,
				maxLength: 128,
				pattern: '^[^<>{}"\'`]*$'
			},
			email: {
				type: 'string',
				minLength: 8,
				maxLength: 254,
				format: 'email',
				pattern: '^[^<>{}"\'`]*$'
			}
		},
		additionalProperties: false
	}
}

// modifier le 18/09/2025
export const updateSchema = {
	$id: 'updateSchema',
	body: {
		type: 'object',
		required: ['name', 'password', 'toUpdate', 'newValue'],
		properties: {
			name: {
				type: 'string',
				minLength: 1,
				maxLength: 64,
				pattern: '^[^<>{}"\'`]*$'
			},
			password: {
				type: 'string',
				minLength: 8,
				maxLength: 128,
				pattern: '^[^<>{}"\'`]*$'
			},
			toUpdate: {
				type: 'string',
				enum: ['picture', 'password', 'email', 'telephone']
			},
			newValue: {
				type: 'string',
				minLength: 1,
				maxLength: 254,
				pattern: '^[^<>{}"\'`]*$'
			}
		},
		additionalProperties: false
	}
}

// export const userInput = {
// 	$id: 'userInput',
// 	body: {
// 		type: 'object',
// 		required: ['name', 'password', 'email'],
// 		properties: {
// 			name: { type: 'string', minLength: 1 },// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
// 			password: { type: 'string', minLength: 8 },
// 			email: { type: 'string', minLength: 8 } // TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
// 		},
// 		additionalProperties: false
// 	}
// }

// export const updateSchema = {
// 	$id: 'updateSchema',
// 	body: {
// 		type: 'object',
// 		required: [ 'name', 'password' , 'toUpdate', 'newValue' ],
// 		properties: {
// 			name: { type: 'string', minLength: 1 },// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
// 			password: { type: 'string', minLength: 8 },
// 			toUpdate: {
// 				type: 'string',
// 				enum: [ 'picture', 'password', 'email', 'telephone' ]// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
// 			},
// 			newValue: { type: 'string' }// TODO parsing mail // pattern: '^[^<>&]*$' pour parser les infos //! peutre maxLenght aussi
// 		},
// 		additionalProperties: false
// 	}
// }