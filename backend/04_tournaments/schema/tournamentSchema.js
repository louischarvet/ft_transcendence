// schema/tournamentSchema.js

// ajout le 19/09/2025
export const tournamentSchema = {
	$id: 'tournamentSchema',
	body: {
		type: 'object',
		required: ['numberOfMatch'],
		properties: {
			numberOfMatch: {
				type: 'integer',
				enum: ['4', '8', '16']
			},
		},
		additionalProperties: false
	}
}
