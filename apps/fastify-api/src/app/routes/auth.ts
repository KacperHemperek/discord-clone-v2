import { FastifyPluginCallback } from 'fastify';

type User = {
  id: number;
  username: string;
  password: string;
};

const users: User[] = [
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
  fastify.post<{ Body: User }>('/login', {
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

      const userObj = {
        id: user.id,
        username: user.username,
      };

      const accessToken = fastify.jwt.sign(userObj, {
        expiresIn: '20s',
      });

      const refreshToken = fastify.jwt.sign(userObj, {
        expiresIn: '7d',
      });

      fastify.addAccessTokenToCookies(reply, accessToken);
      fastify.addRefreshTokenToCookies(reply, refreshToken);

      return {
        message: 'User logged in successfully',
        user: {
          id: user.id,
          username: user.username,
        },
      };
    },
  });

  fastify.post('/logout', {
    handler: async (_request, reply) => {
      fastify.removeAccessTokenFromCookies(reply);
      fastify.removeRefreshTokenFromCookies(reply);
      return { message: 'User logged out successfully' };
    },
  });

  fastify.get('/me', {
    handler: async (request) => {
      return { user: request.user };
    },
  });

  fastify.log.info(`[ routes ] Auth routes loaded.`);
};

export default authPlugin;
