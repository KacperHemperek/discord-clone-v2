import { Static } from '@sinclair/typebox';
import {
  CreateChatWithUsersSchema,
  GetChatsSuccessResponseSchema,
} from '@api/app/routes/chats/chats.schema';

export type CreateChatWithUsersType = Static<typeof CreateChatWithUsersSchema>;

export type GetChatsSuccessResponseType = Static<
  typeof GetChatsSuccessResponseSchema
>;
