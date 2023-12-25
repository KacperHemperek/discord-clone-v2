import { User } from '@prisma/client';
import { FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import type {
  AuthLoginRequestBody,
  AuthRegisterRequestBody,
} from '@api/types/auth';

const authPlugin: FastifyPluginCallback = async (fastify) => {
  fastify.post<{ Body: AuthRegisterRequestBody }>('/register', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
          confirmPassword: { type: 'string' },
        },
        required: ['username', 'password', 'confirmPassword'],
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
      const { username, password, confirmPassword } = request.body;

      const user = await fastify.db.user.findFirst({ where: { username } });

      fastify.log.info(
        `[ routes ] User ${username} trying to create account. \n ${user}`
      );

      if (user) {
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: 'User with that username already exists' });
        return await reply;
      }

      const passwordRegex = new RegExp(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{10,32}$/
      );

      if (!passwordRegex.test(password)) {
        return await reply.status(StatusCodes.UNAUTHORIZED).send({
          message:
            'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
        });
      }

      if (password !== confirmPassword) {
        return await reply.status(StatusCodes.UNAUTHORIZED).send({
          message: 'Passwords do not match',
        });
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

  fastify.post<{ Body: AuthLoginRequestBody }>('/login', {
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
          .send({ message: 'Invalid username or password' });
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
