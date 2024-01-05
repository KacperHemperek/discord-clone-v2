import { Static } from '@sinclair/typebox';
import { CreateChatWithUsersSchema } from '@api/app/routes/chats/chats.schema';

export type CreateChatWithUsersType = Static<typeof CreateChatWithUsersSchema>;
