import {
  AddRefreshTokenToCookiesHandler,
  AddAccessTokenToCookiesHandler,
  GetTokensFromCookiesHandler,
  RemoveTokenFromCookiesHandler,
  CookiesConfig,
} from './app/plugins/cookies';

import { SignTokenHandler, VerifyTokenHandler } from './app/plugins/auth';

export type RequestUser = {
  id: number;
  username: string;
};

export type DecodedToken = RequestUser & {
  iat: number;
  exp: number;
};

declare module 'fastify' {
  interface FastifyInstance {
    user: RequestUser | null;
    deserializeUser: (request: FastifyRequest) => void;
    addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler;
    addAccessTokenToCookies: AddAccessTokenToCookiesHandler;
    getTokensFromCookies: GetTokensFromCookiesHandler;
    cookieConfig: CookiesConfig;
    signAccessToken: SignTokenHandler;
    signRefreshToken: SignTokenHandler;
    verifyToken: VerifyTokenHandler;
  }

  interface FastifyReply {
    removeAccessTokenFromCookies: RemoveTokenFromCookiesHandler;
    removeRefreshTokenFromCookies: RemoveTokenFromCookiesHandler;
  }
}
