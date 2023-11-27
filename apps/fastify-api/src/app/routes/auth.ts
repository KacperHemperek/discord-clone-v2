import { RequestUser } from 'apps/fastify-api/src';
import { FastifyPluginCallback } from 'fastify';

type DbUser = {
  id: number;
  username: string;
  password: string;
};

const users: DbUser[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
  },
  {
    id: 2,
    username: 'user',
    password: 'user',
  },
];

const authPlugin: FastifyPluginCallback = async (fastify) => {
  fastify.post<{ Body: DbUser }>('/login', {
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
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { username, password } = request.body;
      const user = users.find((user) => user.username === username);

      if (!user || user.password !== password) {
        reply.status(401).send({ message: 'Invalid credentials' });
        return await reply;
      }

      const userObj: RequestUser = {
        id: user.id,
        username: user.username,
      };

      const accessToken = await fastify.signAccessToken(userObj);

      const refreshToken = await fastify.signRefreshToken(userObj);

      fastify.addAccessTokenToCookies(reply, accessToken);
      fastify.addRefreshTokenToCookies(reply, refreshToken);

      return {
        user: {
          id: user.id,
          username: user.username,
        },
      };
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
    preHandler: fastify.deserializeUser,
    handler: async (request) => {
      return { user: request.user };
    },
  });

  fastify.log.info(`[ routes ] Auth routes loaded.`);
};

export default authPlugin;
