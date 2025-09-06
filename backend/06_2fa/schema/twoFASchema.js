// schema/twoFASchema.js

export const twoFASchema = {
	$id: 'twoFASchema',
	body: {
		type: 'object',
		required: [ 'id', 'name', 'email' ],
		properties: {
			id: { type: 'integer' },
			name: { type: 'string', minLength: 1 },
			email: { type: 'string', minLength: 3 }
		},
		additionalProperties: false
	}
}
