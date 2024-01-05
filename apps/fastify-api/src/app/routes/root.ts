import { FastifyInstance } from 'fastify';
import authRouter from './auth/auth.routes';
import { friendsRoutes } from './friends/friends.routes';
import { chatRoutes } from './chats/chats.routes';

export default async function (fastify: FastifyInstance) {
  fastify.register(authRouter, { prefix: '/auth' });
  fastify.register(friendsRoutes, { prefix: '/friends' });
  fastify.register(chatRoutes, { prefix: '/chats' });
  fastify.log.info(`[ routes ] Routes loaded.`);
}
