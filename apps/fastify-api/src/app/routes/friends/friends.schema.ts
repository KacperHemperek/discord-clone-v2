import { Type } from '@sinclair/typebox';

export const SendFriendRequestBody = Type.Object({
  email: Type.String(),
});
