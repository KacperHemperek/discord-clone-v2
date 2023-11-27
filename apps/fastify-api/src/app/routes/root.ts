import { FastifyInstance } from 'fastify';
import wsRouter from './ws';
import authRouter from './auth';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preValidation', fastify.serializeUser);
  fastify.register(wsRouter, { prefix: '/ws' });
  fastify.register(authRouter, { prefix: '/auth' });
  fastify.log.info(`REGISTERED ROUTES`);
}
