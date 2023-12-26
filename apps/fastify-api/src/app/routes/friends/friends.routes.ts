import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { SocketStream } from '@fastify/websocket';
import { SendFriendRequestBodyType } from '@shared-types/friends';
// import {
//   ALL_FRIEND_INVITES_TYPE,
//   NEW_FRIEND_INVITE_TYPE,
// } from '@configs/friends';
import { SendFriendRequestBody } from './friends.schema';

type InviterUser = {
  inviterId: string;
  inviterUsername: string;
  inviterEmail: string;
};

export const friendsRoutes = async (fastify: FastifyInstance) => {
  const connetions = new Map<string, SocketStream>();

  fastify.get('/', {
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      // TODO implement friends list

      return rep.status(StatusCodes.OK).send({ hello: 'friends' });
    },
  });

  fastify.post<{ Body: SendFriendRequestBodyType }>('/', {
    schema: {
      body: SendFriendRequestBody,
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (req, rep) => {
      const { email } = req.body;

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

      await fastify.db.friendship.create({
        data: {
          accepted: false,
          inviterId: req.user.id,
          inviteeId: user.id,
        },
      });

      const conn = connetions.get(user.id);

      // send notification to the user when he receives a friend invite
      if (conn) {
        const inviterUser: InviterUser = {
          inviterId: req.user.id,
          inviterUsername: req.user.username,
          inviterEmail: req.user.email,
        };
        conn.socket.send(
          JSON.stringify({
            // type: NEW_FRIEND_INVITE_TYPE,
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
      connetions.set(req.user.id, conn);

      const invites = await fastify.db.friendship.findMany({
        where: {
          inviteeId: req.user.id,
          accepted: false,
        },
        select: {
          inviter: true,
        },
      });

      const modifiedInvites: InviterUser[] = invites.map((invite) => {
        return {
          inviterId: invite.inviter.id,
          inviterUsername: invite.inviter.username,
          inviterEmail: invite.inviter.email,
        };
      });

      conn.socket.send(
        JSON.stringify({
          // type: ALL_FRIEND_INVITES_TYPE,
          type: 'ALL_FRIEND_INVITES',
          payload: modifiedInvites,
        })
      );
    }
  );

  fastify.log.info(`[ routes ] Friends routes loaded.`);
};
