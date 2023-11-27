import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import router from './routes/root';
import sensible from './plugins/sensible';
import auth from './plugins/auth';
import cookies from './plugins/cookies';
import db from './plugins/db';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance) {
  // installed plugins
  await fastify.register(cors, {
    origin: 'http://localhost:4200',
    credentials: true,
  });
  fastify.register(websocket);
  fastify.register(sensible);
  fastify.register(jwt, {
    secret: 'supersecret',
  });

  fastify.register(db);

  fastify.register(cookies);
  fastify.register(auth);

  // custom plugins
  fastify.register(router, { prefix: '/api' });
}
