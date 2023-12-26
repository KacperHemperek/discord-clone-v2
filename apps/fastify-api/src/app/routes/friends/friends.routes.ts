import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

export const friendsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      fastify.log.info(`User ${JSON.stringify(req.user)}`);

      return rep.status(StatusCodes.OK).send({ hello: 'friends' });
    },
  });

  fastify.log.info(`[ routes ] Friends routes loaded.`);
};
