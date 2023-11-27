import { User } from '@prisma/client';
import { FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';

type UserLoginPayload = Pick<User, 'password' | 'username'>;

const authPlugin: FastifyPluginCallback = async (fastify) => {
  fastify.post<{ Body: UserLoginPayload }>('/register', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
      },
      response: {
        [StatusCodes.CREATED]: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
              },
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { username, password } = request.body;
      const user = fastify.db.user.findFirst({ where: { username } });

      if (user) {
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: 'User already exists' });
        return await reply;
      }

      const id = crypto.randomUUID();

      const newUser: User = {
        id,
        username,
        password,
      };

      await fastify.db.user.create({ data: newUser });

      fastify.log.info(`[ routes ] User ${username} created.`);

      const accessToken = await fastify.signAccessToken({ username, id });
      const refreshToken = await fastify.signRefreshToken({ username, id });

      reply.addAccessTokenToCookies(accessToken);
      reply.addRefreshTokenToCookies(refreshToken);

      reply.code(StatusCodes.CREATED).send({
        user: {
          id,
          username,
        },
      });
    },
  });

  fastify.post<{ Body: UserLoginPayload }>('/login', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
      },
      response: {
        [StatusCodes.OK]: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
              },
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { username, password } = request.body;
      const user = await fastify.db.user.findFirst({ where: { username } });

      if (!user || user.password !== password) {
        return await reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: 'Invalid credentials' });
      }

      const userObj = {
        id: user.id,
        username: user.username,
      };

      const accessToken = await fastify.signAccessToken(userObj);
      const refreshToken = await fastify.signRefreshToken(userObj);

      reply.addAccessTokenToCookies(accessToken);
      reply.addRefreshTokenToCookies(refreshToken);

      reply.status(StatusCodes.OK).send({
        user: { id: user.id, username: user.username },
      });
    },
  });

  fastify.post('/logout', {
    handler: async (_request, reply) => {
      reply.removeAccessTokenFromCookies();
      reply.removeRefreshTokenFromCookies();

      return await reply.send({ message: 'Logged out' });
    },
  });

  fastify.get('/me', {
    schema: {
      response: {
        [StatusCodes.OK]: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
              },
            },
          },
        },
        [StatusCodes.UNAUTHORIZED]: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.user) {
        return await reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: 'User not logged in' });
      }

      return await reply.status(StatusCodes.OK).send({ user: request.user });
    },
  });

  fastify.log.info(`[ routes ] Auth routes loaded.`);
};

export default authPlugin;
