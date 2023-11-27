import { CookieSerializeOptions } from '@fastify/cookie';
import {
  AddRefreshTokenToCookiesHandler,
  AddAccessTokenToCookiesHandler,
  GetTokensFromCookiesHandler,
  RemoveTokenFromCookiesHandler,
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
    serializeUser: (request: FastifyRequest) => void;
    addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler;
    addAccessTokenToCookies: AddAccessTokenToCookiesHandler;
    getTokensFromCookies: GetTokensFromCookiesHandler;
    removeAccessTokenFromCookies: RemoveTokenFromCookiesHandler;
    removeRefreshTokenFromCookies: RemoveTokenFromCookiesHandler;
    authCookieOptions: CookieSerializeOptions;
    signAccessToken: SignTokenHandler;
    signRefreshToken: SignTokenHandler;
    verifyAccessToken: VerifyTokenHandler;
  }
}
