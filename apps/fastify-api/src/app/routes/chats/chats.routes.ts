import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import {
  AllMessagesType,
  ChatMessage,
  CreateChatWithUsersBodyType,
  GetChatsSuccessResponseType,
  NewMessageType,
} from '@shared/types/chats';
import {
  CreateChatWithUsersSuccessResponseSchema,
  CreateChatWithUsersBodySchema,
  GetChatsSuccessResponseSchema,
  ChatTypes,
} from './chats.schema';
import { ApiError } from '../../utils/errors';
import { FriendRequestStatus } from '../friends/friends.routes';
import { SocketStream } from '@fastify/websocket';

type ConnectionObj = { conn: SocketStream; ipAddr: string };

export enum ChatMessageType {
  allMessages = 'ALL_MESSAGES',
  newMessage = 'NEW_MESSAGE',
}

export async function chatRoutes(fastify: FastifyInstance) {
  const connections = new Map<string, ConnectionObj[]>();

  function sendMessageToAllConnectedUsers(
    chatId: string,
    message: ChatMessage
  ) {
    const connectionArr = connections.get(chatId);

    if (connectionArr) {
      connectionArr.forEach((conn) => {
        const messageObj: NewMessageType = {
          type: ChatMessageType.newMessage,
          message,
        };

        conn.conn.socket.send(JSON.stringify(messageObj));
      });
    }
  }

  function replaceConnection(
    chatId: string,
    ipAddr: string,
    conn: SocketStream
  ) {
    fastify.log.info(
      '[ chatRoutes ] Replacing users connection for chat messages'
    );
    const connectionArr = connections.get(chatId) || [];

    const updatedConnectionArr = connectionArr.filter(
      (conn) => conn.ipAddr === ipAddr
    );
    updatedConnectionArr.push({ conn, ipAddr });
    connections.set(chatId, updatedConnectionArr);
  }

  fastify.post<{ Body: CreateChatWithUsersBodyType }>('/', {
    schema: {
      body: CreateChatWithUsersBodySchema,
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

      const allMembers = [...friends, req.user];

      if (allMembers.length === 2) {
        const existingChat = await fastify.db.chat.findFirst({
          where: {
            type: ChatTypes.private,
            users: {
              every: {
                id: {
                  in: allMembers.map((member) => member.id),
                },
              },
            },
            name: null,
          },
        });

        if (existingChat) {
          return rep.code(201).send({ chatId: existingChat.id });
        }

        const chat = await fastify.db.chat.create({
          data: {
            users: {
              connect: allMembers.map((member) => ({ id: member.id })),
            },
            type: ChatTypes.private,
          },
        });

        return rep.code(201).send({ chatId: chat.id });
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
          type: ChatTypes.group,
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
          users: {
            select: {
              id: true,
              username: true,
            },
          },
          type: true,
        },
      });

      const response: GetChatsSuccessResponseType['chats'] = chats.map(
        (chat) => {
          return {
            ...chat,
            usersCount: chat._count.users,
            type: chat.type as ChatTypes,
          };
        }
      );

      rep.status(StatusCodes.OK).send({ chats: response });
    },
  });

  fastify.get<{ Params: { chatId: string } }>(
    '/:chatId/messages',
    {
      preHandler: fastify.auth([fastify.userRequired]),
      websocket: true,
    },
    async (connection, req) => {
      const connectionArr = connections.get(req.params.chatId) || [];

      const chat = await fastify.db.chat.findUnique({
        where: { id: req.params.chatId },
        select: {
          users: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          name: true,
          type: true,
        },
      });

      if (!chat) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Chat with id ${req.params.chatId} not found`
        );
      }

      if (!chat.users.some((user) => user.id === req.user.id)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `User ${req.user.username} is not a member of chat ${req.params.chatId}`
        );
      }

      if (connectionArr.length === 0) {
        fastify.log.info(
          `[ ${req.url} ] No connections for chat ${req.params.chatId}. Adding new connections.`
        );

        connections.set(req.params.chatId, [
          { conn: connection, ipAddr: req.ip },
        ]);
      }

      const hasConnection = connectionArr.some((conn) => {
        return conn.ipAddr === req.ip;
      });

      if (hasConnection) {
        replaceConnection(req.params.chatId, req.ip, connection);
      }

      fastify.log.info(
        `[ ${req.url} ] Connection established for chat ${req.params.chatId}`
      );

      connection.socket.on('close', () => {
        fastify.log.info(
          `[ ${req.url} ] Connection closed for chat ${req.params.chatId}`
        );
        if (connections.has(req.params.chatId)) {
          const connectionArr = connections.get(req.params.chatId) || [];
          const updatedConnectionArr = connectionArr.filter(
            (conn) => conn.ipAddr !== req.ip
          );
          connections.set(req.params.chatId, updatedConnectionArr);
          console.log(connections.get(req.params.chatId));
        }
      });

      connection.socket.on('message', async (data) => {
        fastify.log.info(
          `[ ${req.url} ] Message received for chat ${req.params.chatId}`
        );

        const text = data.toString();

        const message = await fastify.db.message.create({
          data: {
            chatId: req.params.chatId,
            senderId: req.user.id,
            text,
          },
        });

        sendMessageToAllConnectedUsers(req.params.chatId, {
          id: message.id,
          senderId: message.senderId,
          text: message.text,
          image: message.image,
          createdAt: message.createdAt,
        });
      });

      const messages = await fastify.db.message.findMany({
        where: {
          chatId: req.params.chatId,
        },
        select: {
          id: true,
          senderId: true,
          text: true,
          image: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const allMessages: AllMessagesType = {
        type: ChatMessageType.allMessages,
        messages: messages.map((message) => {
          return {
            id: message.id,
            senderId: message.senderId,
            text: message.text,
            image: message.image,
            createdAt: message.createdAt,
          };
        }),
        chatName: chat.name,
        chatType: chat.type as ChatTypes,
        members: chat.users,
      };

      connection.socket.send(JSON.stringify(allMessages));
    }
  );

  fastify.log.info(`[ routes ] Chats routes loaded.`);
}
