import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SocketStream } from '@fastify/websocket';
import { FriendType, SendFriendRequestBodyType } from '@shared/types/friends';

import {
  GetAllFriendsResponseBody,
  SendFriendRequestBody,
} from './friends.schema';
import { MessageSuccessResponse } from '../../utils/commonResponses';
import { ApiError } from '../../utils/errors';

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

type FriendRequest = {
  id: string;
  username: string;
  email: string;
  seen: boolean;
};

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
        [StatusCodes.OK]: MessageSuccessResponse,
      },
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const { email } = req.body;

      if (req.user.email === email) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `You can't send friend invite to yourself`
        );
      }

      const user = await fastify.db.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `User with email ${email} not found`
        );
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

      // TODO: if user declined friend request, we can send it again after some time (1 day?)
      // TODO: if user that declined friend request is the one that sends friend request now send the request without the time limit
      if (existingFriendship) {
        const messages = {
          pending: `You already send friend request to user ${user.username}`,
          accepted: `You are already friends with user ${user.username}`,
          declined: `${user.username} declined your friend request`,
        };

        const message =
          messages[existingFriendship.status as keyof typeof messages];

        throw new ApiError(StatusCodes.BAD_REQUEST, message);
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
    schema: {
      response: {
        [StatusCodes.OK]: MessageSuccessResponse,
      },
    },
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
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friend invite not found');
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
    schema: {
      response: {
        [StatusCodes.OK]: MessageSuccessResponse,
      },
    },
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
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friend invite not found');
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
