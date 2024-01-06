import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import {
  CreateChatWithUsersType,
  GetChatsSuccessResponseType,
} from '@shared/types/chats';
import {
  CreateChatWithUsersSuccessResponseSchema,
  CreateChatWithUsersSchema,
  GetChatsSuccessResponseSchema,
} from './chats.schema';
import { ApiError } from '../../utils/errors';
import { FriendRequestStatus } from '../friends/friends.routes';

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateChatWithUsersType }>('/', {
    schema: {
      body: CreateChatWithUsersSchema,
      response: {
        [StatusCodes.CREATED]: CreateChatWithUsersSuccessResponseSchema,
      },
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      fastify.log.info(
        `[ ${req.url} ] Creating chat with users: ${req.body.userIds}`
      );

      const relations = await fastify.db.friendship.findMany({
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
          status: FriendRequestStatus.accepted,
        },
        select: {
          inviteeId: true,
          inviter: {
            select: {
              id: true,
              username: true,
            },
          },
          invitee: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      const friends = relations.map((friend) => {
        return friend.inviteeId === req.user.id
          ? friend.inviter
          : friend.invitee;
      });

      // check if all users are friends
      if (relations.length !== req.body.userIds.length) {
        const notFoundIds = req.body.userIds.filter((id) => {
          return !friends.some((friend) => friend.id !== id);
        });

        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `User ids not found as friends of user ${
            req.user.username
          }: ${notFoundIds.join(', ')}`
        );
      }

      const concatFriendUsernames = friends
        .map((friend) => friend.username)
        .join(',');

      const defaultChatName = `${req.user.username},${concatFriendUsernames}`;

      const chat = await fastify.db.chat.create({
        data: {
          users: {
            connect: [...req.body.userIds, req.user.id].map((id) => ({ id })),
          },
          name: defaultChatName,
        },
      });

      rep.code(201).send({ chatId: chat.id });
    },
  });

  fastify.get('/', {
    schema: {
      response: {
        [StatusCodes.OK]: GetChatsSuccessResponseSchema,
      },
    },
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
          name: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      const response: GetChatsSuccessResponseType['chats'] = chats.map(
        (chat) => {
          return {
            id: chat.id,
            name: chat.name,
            usersCount: chat._count.users,
          };
        }
      );

      rep.status(StatusCodes.OK).send({ chats: response });
    },
  });

  fastify.log.info(`[ routes ] Chats routes loaded.`);
}
