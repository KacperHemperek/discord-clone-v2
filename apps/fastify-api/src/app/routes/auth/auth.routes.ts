import { FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import {
  GetLoggedInUserResponse,
  LoginUserBody,
  LoginUserSuccessfullyResponse,
  LogoutUserSuccessfullyResponse,
  RegisterUserBody,
  RegisterUserCreatedResponse,
} from './auth.schema';
import { LoginUserBodyType, RegisterUserBodyType } from '@shared-types/auth';
import { ErrorBaseResponse } from '../../utils/error-response';

const authPlugin: FastifyPluginCallback = async (fastify) => {
  fastify.post<{ Body: RegisterUserBodyType }>('/register', {
    schema: {
      body: RegisterUserBody,
      response: {
        [StatusCodes.CREATED]: RegisterUserCreatedResponse,
        [StatusCodes.UNAUTHORIZED]: ErrorBaseResponse,
      },
    },
    handler: async (request, reply) => {
      fastify.log.info(`[ routes/auth/register ] Registering user...`);
      const { username, password, confirmPassword, email } = request.body;

      const user = await fastify.db.user.findUnique({ where: { email } });

      if (user) {
        fastify.log.info(`[ routes/auth/register ] User already exists.`);
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: 'User with that email already exists' });
        return await reply;
      }

      const passwordRegex = new RegExp(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{10,32}$/
      );

      if (!passwordRegex.test(password)) {
        fastify.log.info(
          `[ routes/auth/register ] Password does not match restrictions.`
        );
        return await reply.status(StatusCodes.UNAUTHORIZED).send({
          message:
            'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
        });
      }

      if (password !== confirmPassword) {
        fastify.log.info(`[ routes/auth/register ] Passwords do not match.`);
        return await reply.status(StatusCodes.UNAUTHORIZED).send({
          message: 'Passwords do not match',
        });
      }

      const createdUser = await fastify.db.user.create({
        data: {
          username,
          password,
          email,
        },
      });

      const userObj = {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
      };

      const accessToken = await fastify.signAccessToken(userObj);
      const refreshToken = await fastify.signRefreshToken(userObj);

      reply.addAccessTokenToCookies(accessToken);
      reply.addRefreshTokenToCookies(refreshToken);

      fastify.log.info(
        `[ routes/auth/register ] User registered successfully.`
      );

      reply.code(StatusCodes.CREATED).send({
        message: 'User successfully registered',
        user: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
        },
      });
    },
  });

  fastify.post<{ Body: LoginUserBodyType }>('/login', {
    schema: {
      body: LoginUserBody,
      response: {
        [StatusCodes.OK]: LoginUserSuccessfullyResponse,
        [StatusCodes.UNAUTHORIZED]: ErrorBaseResponse,
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body;
      const user = await fastify.db.user.findUnique({ where: { email } });

      if (!user || user.password !== password) {
        return await reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: 'Invalid username or password' });
      }

      const userObj = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      const accessToken = await fastify.signAccessToken(userObj);
      const refreshToken = await fastify.signRefreshToken(userObj);

      reply.addAccessTokenToCookies(accessToken);
      reply.addRefreshTokenToCookies(refreshToken);

      reply.status(StatusCodes.OK).send({
        message: 'User successfully logged in',
        user: { id: user.id, username: user.username, email: user.email },
      });
    },
  });

  fastify.post('/logout', {
    schema: {
      response: {
        [StatusCodes.OK]: LogoutUserSuccessfullyResponse,
      },
    },
    handler: async (_request, reply) => {
      reply.removeAccessTokenFromCookies();
      reply.removeRefreshTokenFromCookies();

      return await reply.status(StatusCodes.OK).send({ message: 'Logged out' });
    },
  });

  fastify.get('/me', {
    schema: {
      response: {
        [StatusCodes.OK]: GetLoggedInUserResponse,
      },
    },
    preHandler: fastify.auth([fastify.userRequired]),
    handler: async (request, reply) => {
      return await reply.status(StatusCodes.OK).send({ user: request.user });
    },
  });

  fastify.log.info(`[ routes ] Auth routes loaded.`);
};

export default authPlugin;
