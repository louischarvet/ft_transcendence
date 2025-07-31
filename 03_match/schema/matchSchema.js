// schema/schema.js

export const userSchema = {
$id: 'userSchema',
//  body: {
    type: 'object',
    required: ['name'],
    properties: {
		id: { type : 'integer'},
      	name: { type: 'string', minLength: 1 },
      	status: { type: 'string', minLength: 1 },
    },
    additionalProperties: false
//  },
//  response: {
//    200: {
//      type: 'object',
//      properties: {
//        success: { type: 'boolean' },
//        userId: { type: 'string' }
//      }
//    }
//  }
}

export const matchSchema = {
	$id: 'matchSchema',
	body: {
		type: 'object',
		required: ['match_type'],
    	properties: {
			match_id: { type : 'integer'},
    	  	player1: { $ref: 'userSchema#' },
			player2: { $ref: 'userSchema#' },
    	  	scoreP1: { type: 'integer' },
    	  	scoreP2: { type: 'integer' },
			winner: { $ref: 'userSchema#' }, // reference au P1 ou P2 ? ou player name (string)
			match_type: { type: 'string' }
    	},
    	additionalProperties: false
  	},
  	response: {
    	200: {
    	  	type: 'object',
    	  	properties: {
        		success: { type: 'boolean' },
        		userId: { type: 'string' }
      		}
    	}
  	}
}