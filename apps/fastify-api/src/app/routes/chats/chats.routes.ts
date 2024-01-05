import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { CreateChatWithUsersType } from '@shared/types/chats';
import {
  CreateChatWithUsersSuccessResponse,
  CreateChatWithUsersSchema,
} from './chats.schema';
import { ApiError } from '../../utils/errors';

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateChatWithUsersType }>('/', {
    schema: {
      body: CreateChatWithUsersSchema,
      response: {
        [StatusCodes.CREATED]: CreateChatWithUsersSuccessResponse,
      },
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      fastify.log.info(
        `[ ${req.url} ] Creating chat with users: ${req.body.userIds}`
      );

      const friends = await fastify.db.friendship.findMany({
        where: {
          OR: [
            {
              inviteeId: {
                in: req.body.userIds,
              },
              inviterId: req.user.id,
            },
            {
              inviteeId: req.user.id,
              inviterId: {
                in: req.body.userIds,
              },
            },
          ],
        },
      });

      // check if all users are friends
      if (friends.length !== req.body.userIds.length) {
        const notFoundIds = req.body.userIds.filter((id) => {
          return !friends.some(
            (friend) => friend.inviteeId === id || friend.inviterId === id
          );
        });

        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `User ids not found as friends of user ${
            req.user.username
          }: ${notFoundIds.join(', ')}`
        );
      }

      const chat = await fastify.db.chat.create({
        data: {
          users: {
            connect: [...req.body.userIds, req.user.id].map((id) => ({ id })),
          },
        },
      });

      rep.code(201).send({ chatId: chat.id });
    },
  });

  fastify.get('/', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      fastify.log.info(`[ ${req.url} ] Getting chats for user.`);

      const chats = await fastify.db.chat.findMany({
        where: {
          users: {
            some: {
              id: req.user.id,
            },
          },
        },
        select: {
          id: true,
          users: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      rep.send({ chats });
    },
  });

  fastify.log.info(`[ routes ] Chats routes loaded.`);
}
