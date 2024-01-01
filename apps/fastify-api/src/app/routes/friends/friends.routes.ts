import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SocketStream } from '@fastify/websocket';
import { SendFriendRequestBodyType } from '@shared-types/friends';
import { SendFriendRequestBody } from './friends.schema';
import { ErrorBaseResponse } from '../../utils/error-response';

type InviterUser = {
  id: string;
  username: string;
  email: string;
  seen: boolean;
};

export enum FriendRequestType {
  newFriendInvite = 'NEW_FRIEND_INVITE',
  allFriendInvites = 'ALL_FRIEND_INVITES',
  friendInviteAccepted = 'FRIEND_INVITE_ACCEPTED',
  friendInviteDeclined = 'FRIEND_INVITE_DECLINED',
}

export enum FriendRequestStatus {
  pending = 'pending',
  accepted = 'accepted',
  declined = 'declined',
}

export const friendsRoutes = async (fastify: FastifyInstance) => {
  const connections = new Map<string, SocketStream>();

  function sendFriendRequestsUpdateToUser<T extends object>({
    type,
    userId,
    payload,
  }: {
    userId: string;
    type: FriendRequestType;
    payload: T;
  }) {
    const conn = connections.get(userId);

    if (conn) {
      fastify.log.info(
        `[ router/friends/invites ] Sending notification to the user ${userId}`
      );

      conn.socket.send(
        JSON.stringify({
          type,
          payload,
        })
      );
    }
  }

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

        const inviterUser: InviterUser = {
        id: friendRequest.inviter.id,
        username: friendRequest.inviter.username,
        email: friendRequest.inviter.email,
          seen: friendRequest.seen,
        };

      sendFriendRequestsUpdateToUser({
        userId: user.id,
        type: FriendRequestType.newFriendInvite,
            payload: inviterUser,
      });

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
          status: FriendRequestStatus.pending,
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
          id: invite.inviter.id,
          username: invite.inviter.username,
          email: invite.inviter.email,
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

  fastify.put<{ Params: { inviteId: string } }>('/invites/seen', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      await fastify.db.friendship.updateMany({
        where: {
          inviteeId: req.user.id,
          seen: false,
        },
        data: {
          seen: true,
        },
      });

      fastify.log.info(
        `[ router/friends/invites ] Friend invites marked as seen for user ${req.user.username}`
      );

      rep.send({
        message: `Friend invites for user ${req.user.username} marked as seen`,
      });
    },
  });

  fastify.log.info(`[ routes ] Friends routes loaded.`);
};
