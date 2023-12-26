import { PrismaClient } from '@prisma/client';

import {
  AddRefreshTokenToCookiesHandler,
  AddAccessTokenToCookiesHandler,
  GetTokensFromCookiesHandler,
  RemoveTokenFromCookiesHandler,
  CookiesConfig,
} from './app/plugins/cookies';

import { SignTokenHandler, VerifyTokenHandler } from './app/plugins/auth';

export type RequestUser = {
  id: string;
  username: string;
};

declare module 'fastify' {
  interface FastifyInstance {
    user: RequestUser | null;
    userRequired: (request: FastifyRequest) => void;
    cookieConfig: CookiesConfig;
    signAccessToken: SignTokenHandler;
    signRefreshToken: SignTokenHandler;
    verifyToken: VerifyTokenHandler;
    db: PrismaClient;
  }

  interface FastifyReply {
    addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler;
    addAccessTokenToCookies: AddAccessTokenToCookiesHandler;
    removeAccessTokenFromCookies: RemoveTokenFromCookiesHandler;
    removeRefreshTokenFromCookies: RemoveTokenFromCookiesHandler;
  }

  interface FastifyRequest {
    getTokensFromCookies: GetTokensFromCookiesHandler;
  }
}
