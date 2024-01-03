import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SocketStream } from '@fastify/websocket';
import { FriendType, SendFriendRequestBodyType } from '@shared/types/friends';
import {
  GetAllFriendsResponseBody,
  SendFriendRequestBody,
} from './friends.schema';
import {
  ErrorBaseResponse,
  MessageSuccessResponse,
} from '../../utils/commonResponses';

type FriendRequest = {
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
    schema: {
      response: {
        [StatusCodes.OK]: GetAllFriendsResponseBody,
      },
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const friends = await fastify.db.friendship.findMany({
        where: {
          OR: [
            {
              inviteeId: req.user.id,
              status: FriendRequestStatus.accepted,
            },
            {
              inviterId: req.user.id,
              status: FriendRequestStatus.accepted,
            },
          ],
        },
        select: {
          inviter: {
            select: {
              id: true,
              username: true,
              email: true,
              active: true,
            },
          },
          invitee: {
            select: {
              id: true,
              username: true,
              email: true,
              active: true,
            },
          },
        },
      });

      const friendList: FriendType[] = friends.map((friend) => {
        let result: FriendType;

        if (friend.inviter.id === req.user.id) {
          result = {
            id: friend.invitee.id,
            email: friend.invitee.email,
            username: friend.invitee.username,
            active: friend.invitee.active,
          };
        } else {
          result = {
            id: friend.inviter.id,
            username: friend.inviter.username,
            email: friend.inviter.email,
            active: friend.inviter.active,
          };
        }

        return result;
      });

      return rep.status(StatusCodes.OK).send({ friends: friendList });
    },
  });

  fastify.post<{ Body: SendFriendRequestBodyType }>('/invites', {
    schema: {
      body: SendFriendRequestBody,
      response: {
        [StatusCodes.BAD_REQUEST]: ErrorBaseResponse,
        [StatusCodes.NOT_FOUND]: ErrorBaseResponse,
        [StatusCodes.OK]: MessageSuccessResponse,
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
          message: `User with email ${email} not found`,
        });
      }

      const existingFriendship = await fastify.db.friendship.findFirst({
        where: {
          OR: [
            {
              inviterId: req.user.id,
              inviteeId: user.id,
            },
            {
              inviterId: user.id,
              inviteeId: req.user.id,
            },
          ],
        },
      });

      if (existingFriendship) {
        return await rep.status(StatusCodes.BAD_REQUEST).send({
          message: `You are already friends with user ${user.username}`,
        });
      }

      const friendRequest = await fastify.db.friendship.create({
        data: {
          inviterId: req.user.id,
          inviteeId: user.id,
        },
        select: {
          id: true,
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

      const inviterUser: FriendRequest = {
        id: friendRequest.id,
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
          id: true,
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

      const modifiedInvites: FriendRequest[] = invites.map((invite) => {
        return {
          id: invite.id,
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

  fastify.put<{ Params: { inviteId: string } }>('/invites/:inviteId/accept', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const { inviteId } = req.params;

      const invite = await fastify.db.friendship.findFirst({
        where: {
          id: inviteId,
          inviteeId: req.user.id,
          status: FriendRequestStatus.pending,
        },
        select: {
          id: true,
          inviter: {
            select: {
              username: true,
            },
          },
        },
      });

      if (!invite) {
        return await rep.status(StatusCodes.NOT_FOUND).send({
          message: `Friend invite not found`,
        });
      }

      await fastify.db.friendship.update({
        where: {
          id: inviteId,
        },
        data: {
          status: FriendRequestStatus.accepted,
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

      fastify.log.info(
        `[ router/friends/invites ] Friend request accepted from user ${invite.inviter.username}`
      );

      rep.send({
        message: `Friend invite from user ${invite.inviter.username} accepted`,
      });
    },
  });

  fastify.put<{ Params: { inviteId: string } }>('/invites/:inviteId/decline', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const { inviteId } = req.params;

      const invite = await fastify.db.friendship.findFirst({
        where: {
          id: inviteId,
          inviteeId: req.user.id,
          status: FriendRequestStatus.pending,
        },
        select: {
          id: true,
          inviter: {
            select: {
              username: true,
            },
          },
        },
      });

      if (!invite) {
        return await rep.status(StatusCodes.NOT_FOUND).send({
          message: `Friend invite not found`,
        });
      }

      await fastify.db.friendship.update({
        where: {
          id: inviteId,
        },
        data: {
          status: FriendRequestStatus.declined,
        },
      });

      fastify.log.info(
        `[ router/friends/invites ] Friend request declined from user ${invite.inviter.username}`
      );

      rep.send({
        message: `Friend invite from user ${invite.inviter.username} declined`,
      });
    },
  });

  fastify.log.info(`[ routes ] Friends routes loaded.`);
};
