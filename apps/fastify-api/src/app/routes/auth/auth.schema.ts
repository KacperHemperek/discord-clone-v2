import { Type } from '@sinclair/typebox';

const UserResponseSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
});

export const RegisterUserBody = Type.Object({
  email: Type.String(),
  username: Type.String(),
  password: Type.String(),
  confirmPassword: Type.String(),
});

export const RegisterUserCreatedResponse = Type.Object({
  message: Type.String(),
  user: UserResponseSchema,
});

export const LoginUserBody = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export const LoginUserSuccessfullyResponse = Type.Object({
  message: Type.String(),
  user: UserResponseSchema,
});

export const LogoutUserSuccessfullyResponse = Type.Object({
  message: Type.String(),
});

export const GetLoggedInUserResponse = Type.Object({
  user: UserResponseSchema,
});
