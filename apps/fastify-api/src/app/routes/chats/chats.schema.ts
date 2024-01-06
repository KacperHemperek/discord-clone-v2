import { Type } from '@sinclair/typebox';

export const CreateChatWithUsersSchema = Type.Object({
  userIds: Type.Array(Type.String({ minLength: 1 })),
});

export const CreateChatWithUsersSuccessResponseSchema = Type.Object({
  chatId: Type.String(),
});

export const GetChatsSuccessResponseSchema = Type.Object({
  chats: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      usersCount: Type.Number(),
    })
  ),
});
