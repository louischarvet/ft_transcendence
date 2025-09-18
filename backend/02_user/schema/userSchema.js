// schema/schema.js

// modifier le 18/09/2025
export const userSchema = {
	$id: 'userSchema',
	body: {
		type: 'object',
		required: ['id', 'name', 'type', 'status'],
		properties: {
			id: { type: 'integer' },
			name: {
				type: 'string',
				minLength: 1,
				maxLength: 64,
				pattern: '^[^<>{}"\'`]*$'
			},
			type: {
				type: 'string',
				enum: ['guest', 'registered']
			},
			status: {
				type: 'string',
				pattern: '^[^<>{}"\'`]*$',
				enum: ['available', 'logged_out', 'pending', 'in_game']
			}
		},
		additionalProperties: false
	}
}

// export const userSchema = {
// 	$id: 'userSchema',
// 	body: {
// 		type: 'object',
// 		required: [ 'id', 'name', 'type', 'status' ],
// 		properties: {
// 			id: { type : 'integer' },
// 		  	name: { type: 'string', minLength: 1 },
// 			type: {
// 				type: 'string',
// 				enum: [ 'guest', 'registered' ],
// 		  	},
// 			status: { 
// 				type: 'string',
// 				minLength: 1,
// 				enum: ['active', 'logged_out', 'pending']
// 				//! ajout le 16/09/2025
// 			}
// 		},
// 		additionalProperties: false
// 	}
// }
