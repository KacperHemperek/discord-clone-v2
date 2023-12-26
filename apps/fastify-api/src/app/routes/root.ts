import { FastifyInstance } from 'fastify';
import wsRouter from './ws';
import authRouter from './auth/auth.routes';
import { friendsRoutes } from './friends/friends.routes';

export default async function (fastify: FastifyInstance) {
  fastify.register(wsRouter, { prefix: '/ws' });
  fastify.register(authRouter, { prefix: '/auth' });
  fastify.register(friendsRoutes, { prefix: '/friends' });
  fastify.log.info(`[ routes ] Routes loaded.`);
}
