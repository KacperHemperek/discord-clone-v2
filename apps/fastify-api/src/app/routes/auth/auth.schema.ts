import { Type } from '@sinclair/typebox';

export const RegisterUserBody = Type.Object({
  username: Type.String(),
  password: Type.String(),
  confirmPassword: Type.String(),
});
