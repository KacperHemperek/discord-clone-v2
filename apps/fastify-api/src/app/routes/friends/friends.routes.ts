import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SocketStream } from '@fastify/websocket';
import {
  FriendType,
  RemoveFriendBodyType,
  SendFriendRequestBodyType,
} from '@shared/types/friends';

import {
  GetAllFriendsResponseBody,
  RemoveFriendBody,
  SendFriendRequestBody,
} from './friends.schema';
import { MessageSuccessResponse } from '../../utils/commonResponses';
import { ApiError } from '../../utils/errors';
import { ChatTypes } from '../chats/chats.schema';

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

  async function createFriendshipAndSendNotificationToUser({
    inviterId,
    inviteeId,
    friendshipIdToRemove,
  }: {
    inviterId: string;
    inviteeId: string;
    friendshipIdToRemove?: string;
  }) {
    try {
      fastify.log.info(`[ router/friends/invites ] Creating friend request`);
      const friendRequest = await fastify.db.$transaction(async (db) => {
        if (friendshipIdToRemove) {
          await db.friendship.delete({
            where: {
              id: friendshipIdToRemove,
            },
          });
        }

        return await db.friendship.create({
          data: {
            inviterId,
            inviteeId,
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
      });

      if (!friendRequest) {
        throw new Error('Something went wrong while creating friend request');
      }

      const friendRequestToSendToUser: FriendRequest = {
        id: friendRequest.id,
        username: friendRequest.inviter.username,
        email: friendRequest.inviter.email,
        seen: friendRequest.seen,
      };

      sendFriendRequestsUpdateToUser({
        userId: inviteeId,
        type: FriendRequestType.newFriendInvite,
        payload: friendRequestToSendToUser,
      });
    } catch (err) {
      fastify.log.error(
        `[ router/friends/invites ] Error while creating friend request: ${err}`
      );
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Something went wrong while creating friend request'
      );
    }
  }

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

      const invitee = await fastify.db.user.findFirst({
        where: {
          email,
        },
      });

      if (!invitee) {
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
              inviteeId: invitee.id,
            },
            {
              inviterId: invitee.id,
              inviteeId: req.user.id,
            },
          ],
        },
      });

      if (existingFriendship) {
        if (
          existingFriendship.status === FriendRequestStatus.declined &&
          existingFriendship.inviterId === req.user.id
        ) {
          const now = new Date();
          const createdAt = new Date(existingFriendship.requestedAt);

          const diff = now.getTime() - createdAt.getTime();

          const cooldown = 1000 * 60 * 60 * 24;

          if (diff < cooldown) {
            throw new ApiError(
              StatusCodes.BAD_REQUEST,
              `You can't send friend request to user ${invitee.username} for 24 hours after he declined your request`
            );
          }
          await createFriendshipAndSendNotificationToUser({
            inviterId: req.user.id,
            inviteeId: invitee.id,
            friendshipIdToRemove: existingFriendship.id,
          });

          return rep
            .status(StatusCodes.OK)
            .send({ message: 'Successfully send friend invite to the user' });
        }

        if (
          existingFriendship.status === FriendRequestStatus.declined &&
          existingFriendship.inviteeId === req.user.id
        ) {
          await createFriendshipAndSendNotificationToUser({
            inviterId: req.user.id,
            inviteeId: invitee.id,
            friendshipIdToRemove: existingFriendship.id,
          });

          return rep
            .status(StatusCodes.OK)
            .send({ message: 'Successfully send friend invite to the user' });
        }

        const messages = {
          [FriendRequestStatus.pending]: `You already send friend request to user ${invitee.username}`,
          [FriendRequestStatus.accepted]: `You are already friends with user ${invitee.username}`,
        };

        const message =
          messages[existingFriendship.status as keyof typeof messages];

        throw new ApiError(StatusCodes.BAD_REQUEST, message);
      }

      await createFriendshipAndSendNotificationToUser({
        inviterId: req.user.id,
        inviteeId: invitee.id,
      });

      return rep
        .status(StatusCodes.OK)
        .send({ message: 'Successfully send friend invite to the user' });
    },
  });

  fastify.delete<{ Body: RemoveFriendBodyType }>(`/invites`, {
    schema: {
      body: RemoveFriendBody,
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const friendship = await fastify.db.friendship.findFirst({
        where: {
          status: FriendRequestStatus.accepted,
          OR: [
            {
              inviteeId: req.body.friendId,
              inviterId: req.user.id,
            },
            {
              inviterId: req.body.friendId,
              inviteeId: req.user.id,
            },
          ],
        },
      });

      if (!friendship) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Could not find friend connection'
        );
      }
      await fastify.db.$transaction(async (db) => {
        await db.friendship.delete({
          where: {
            id: friendship.id,
          },
        });
        const privateChatToDelete = await db.chat.findFirst({
          where: {
            type: ChatTypes.private,
            users: {
              every: {
                id: {
                  in: [req.user.id, req.body.friendId],
                },
              },
            },
          },
        });

        if (privateChatToDelete) {
          fastify.log.info(
            `[ ${req.url} ] Deleting private chat with id ${privateChatToDelete.id}`
          );
          await db.chat.delete({
            where: {
              id: privateChatToDelete.id,
            },
          });
        }
      });

      rep.send({
        message: 'Friend removed successfully',
      });
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
