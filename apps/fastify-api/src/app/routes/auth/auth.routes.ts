import { FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { LoginUserBodyType, RegisterUserBodyType } from '@shared/types/auth';
import {
  GetLoggedInUserResponse,
  LoginUserBody,
  LoginUserSuccessfullyResponse,
  LogoutUserSuccessfullyResponse,
  RegisterUserBody,
  RegisterUserCreatedResponse,
} from './auth.schema';
import { ApiError } from '../../utils/errors';

const authPlugin: FastifyPluginCallback = async (fastify) => {
  const PASSWORD_SALT = 16;

  fastify.post<{ Body: RegisterUserBodyType }>('/register', {
    schema: {
      body: RegisterUserBody,
      response: {
        [StatusCodes.CREATED]: RegisterUserCreatedResponse,
      },
    },
    handler: async (request, reply) => {
      fastify.log.info(`[ routes/auth/register ] Registering user...`);
      const { username, password, confirmPassword, email } = request.body;

      const hashedPassword = await bcryptjs.hash(password, PASSWORD_SALT);

      const user = await fastify.db.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (user) {
        const field = user.email === email ? 'email' : 'username';

        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          `User with that ${field} already exists`
        );
      }

      const passwordRegex = new RegExp(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{10,32}$/
      );

      if (!passwordRegex.test(password)) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
        );
      }

      if (password !== confirmPassword) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Passwords do not match');
      }

      const createdUser = await fastify.db.user.create({
        data: {
          username,
          password: hashedPassword,
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
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body;
      const user = await fastify.db.user.findUnique({ where: { email } });

      if (!user) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'User with that email does not exist'
        );
      }
      const isPasswordValid = await bcryptjs.compare(password, user.password);

      if (!isPasswordValid) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Incorrect email or password'
        );
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
