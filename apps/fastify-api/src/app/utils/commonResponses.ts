import { Type } from '@sinclair/typebox';

export const ErrorBaseResponse = Type.Object({
  message: Type.String(),
});

export const MessageSuccessResponse = Type.Object({
  message: Type.String(),
});
