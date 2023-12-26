import { FastifyInstance } from 'fastify';
import wsRouter from './ws';
import authRouter from './auth/auth.routes';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.deserializeUser);
  fastify.register(wsRouter, { prefix: '/ws' });
  fastify.register(authRouter, { prefix: '/auth' });
}
