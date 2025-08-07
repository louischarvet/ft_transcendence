// schema/userInput.js

export const userInput = {
	$id: 'userInput',
	body: {
		type: 'object',
		required: ['name', 'password'],
		properties: {
			name: { type: 'string', minLength: 1 },
			password: { type: 'string', minLength: 8 }
		},
		additionalProperties: false
	}
}