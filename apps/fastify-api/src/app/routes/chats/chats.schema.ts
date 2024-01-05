import { Type } from '@sinclair/typebox';

export const CreateChatWithUsersSchema = Type.Object({
  userIds: Type.Array(Type.String({ minLength: 1 })),
});

export const CreateChatWithUsersSuccessResponse = Type.Object({
  chatId: Type.String(),
});
