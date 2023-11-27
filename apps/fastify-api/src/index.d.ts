import { CookieSerializeOptions } from '@fastify/cookie';
import {
  AddRefreshTokenToCookiesHandler,
  AddAccessTokenToCookiesHandler,
  GetTokensFromCookiesHandler,
  RemoveTokenFromCookiesHandler,
} from './app/plugins/cookies';

type RequestUser = {
  id: string;
  username: string;
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
  }
}
