import { Type } from '@sinclair/typebox';

export enum ChatTypes {
  private = 'private',
  group = 'group',
}

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
      name: Type.Union([Type.Null(), Type.String()]),
      usersCount: Type.Number(),
      type: Type.Enum(ChatTypes),
      users: Type.Array(
        Type.Object({
          id: Type.String(),
          username: Type.String(),
        })
      ),
    })
  ),
});
