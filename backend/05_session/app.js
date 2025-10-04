// app.js

import Fastify from 'fastify';
import fastifyJWT from '@jastify/jwt' 

const fastify = Fastify({ logger: true });

fastify.register(fastifyJWT); // + secret