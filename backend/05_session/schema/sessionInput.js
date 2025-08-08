// schema/sessionInput.js

export const sessionInput = {
	$id: 'sessionInput',
	body: {
		type: 'object',
		required: [ 'name', 'role' ],
		body: {
			name: { type: 'string' },
			role: [ 'guest', 'registered' ]
		}
	}
}