// schema/schema.js

export const userSchema = {
$id: 'userSchema',
  body: {
    type: 'object',
    required: ['name', 'password'],
    properties: {
		id: { type : 'integer' },
      	name: { type: 'string', minLength: 1 },
		password: { type: 'string', minLength: 8 },
      	status: { type: 'string', minLength: 1 },
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