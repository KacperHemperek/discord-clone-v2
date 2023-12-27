import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SocketStream } from '@fastify/websocket';
import { SendFriendRequestBodyType } from '@shared-types/friends';
import { SendFriendRequestBody } from './friends.schema';
import { ErrorBaseResponse } from '../../utils/error-response';

type InviterUser = {
  inviterId: string;
  inviterUsername: string;
  inviterEmail: string;
  seen: boolean;
};

export const friendsRoutes = async (fastify: FastifyInstance) => {
  const connections = new Map<string, SocketStream>();

  fastify.get('/', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      // TODO implement friends list

      return rep.status(StatusCodes.OK).send({ hello: 'friends' });
    },
  });

  fastify.post<{ Body: SendFriendRequestBodyType }>('/invites', {
    schema: {
      body: SendFriendRequestBody,
      response: {
        [StatusCodes.BAD_REQUEST]: ErrorBaseResponse,
        [StatusCodes.NOT_FOUND]: ErrorBaseResponse,
      },
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const { email } = req.body;

      if (req.user.email === email) {
        return await rep.status(StatusCodes.BAD_REQUEST).send({
          message: `You can't send friend invite to yourself`,
        });
      }

      const user = await fastify.db.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        return await rep.status(StatusCodes.NOT_FOUND).send({
          message: `User with email not found`,
        });
      }

      const friendRequest = await fastify.db.friendship.create({
        data: {
          accepted: false,
          inviterId: req.user.id,
          inviteeId: user.id,
        },
        select: {
          inviter: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          seen: true,
        },
      });

      const conn = connections.get(user.id);

      // send notification to the user when he receives a friend invite
      if (conn) {
        fastify.log.info(
          `[ router/friends/invites ] Sending notification to the user ${user.username}`
        );

        const inviterUser: InviterUser = {
          inviterId: friendRequest.inviter.id,
          inviterUsername: friendRequest.inviter.username,
          inviterEmail: friendRequest.inviter.email,
          seen: friendRequest.seen,
        };
        conn.socket.send(
          JSON.stringify({
            type: 'NEW_FRIEND_INVITE',
            payload: inviterUser,
          })
        );
      }

      return rep
        .status(StatusCodes.OK)
        .send({ message: 'Successfully send friend invite to the user' });
    },
  });

  fastify.get(
    '/invites',
    {
      websocket: true,
      preHandler: fastify.auth([fastify.userRequired]),
    },
    async (conn, req) => {
      const existingConn = connections.get(req.user.id);

      if (existingConn) {
        fastify.log.info('Closing existing connection');
        existingConn.socket.close();
        connections.delete(req.user.id);
      }

      connections.set(req.user.id, conn);

      const invites = await fastify.db.friendship.findMany({
        where: {
          inviteeId: req.user.id,
          accepted: false,
        },
        select: {
          inviter: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          seen: true,
        },
      });

      const modifiedInvites: InviterUser[] = invites.map((invite) => {
        return {
          inviterId: invite.inviter.id,
          inviterUsername: invite.inviter.username,
          inviterEmail: invite.inviter.email,
          seen: invite.seen,
        };
      });

      conn.socket.send(
        JSON.stringify({
          type: 'ALL_FRIEND_INVITES',
          payload: modifiedInvites,
        })
      );
    }
  );

  fastify.log.info(`[ routes ] Friends routes loaded.`);
};
