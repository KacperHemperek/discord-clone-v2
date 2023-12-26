import { SendFriendRequestBody } from '@api/app/routes/friends/friends.schema';
import { Static } from '@sinclair/typebox';

export type SendFriendRequestBodyType = Static<typeof SendFriendRequestBody>;
