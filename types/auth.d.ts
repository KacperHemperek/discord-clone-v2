import {
  GetLoggedInUserResponse,
  LoginUserBody,
  LoginUserSuccessfullyResponse,
  LogoutUserSuccessfullyResponse,
  RegisterUserBody,
  RegisterUserCreatedResponse,
} from '@api/app/routes/auth/auth.schema';
import { Static } from '@sinclair/typebox';

export type RegisterUserBodyType = Static<typeof RegisterUserBody>;

export type RegisterUserCreatedResponseType = Static<
  typeof RegisterUserCreatedResponse
>;

export type LoginUserBodyType = Static<typeof LoginUserBody>;

export type LoginUserSuccessfullyResponseType = Static<
  typeof LoginUserSuccessfullyResponse
>;

export type LogoutUserSuccessfullyResponseType = Static<
  typeof LogoutUserSuccessfullyResponse
>;

export type GetLoggedInUserResponseType = Static<
  typeof GetLoggedInUserResponse
>;
