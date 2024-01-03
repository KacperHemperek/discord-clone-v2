import { FastifyInstance } from 'fastify';
import authRouter from './auth/auth.routes';
import { friendsRoutes } from './friends/friends.routes';

export default async function (fastify: FastifyInstance) {
  fastify.register(authRouter, { prefix: '/auth' });
  fastify.register(friendsRoutes, { prefix: '/friends' });
  fastify.log.info(`[ routes ] Routes loaded.`);
}
