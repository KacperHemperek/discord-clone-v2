import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import { getWebsocketConnection } from '../../utils/websocket';
import {
  ALL_FRIEND_INVITES_TYPE,
  NEW_FRIEND_INVITE_TYPE,
} from '@configs/friends';
import { z } from 'zod';

const inviteItemSchema = z.object({
  inviterId: z.string(),
  inviterUsername: z.string(),
  inviterEmail: z.string(),
});

const allFriendsRequestSchema = z.object({
  type: z.literal(ALL_FRIEND_INVITES_TYPE),
  payload: z.array(inviteItemSchema),
});

const newFriendRequestSchema = z.object({
  type: z.literal(NEW_FRIEND_INVITE_TYPE),
  payload: inviteItemSchema,
});

type FriendInvite = z.infer<typeof inviteItemSchema>;

export default function FriendsPage() {
  const { user } = useAuth();

  const [notifications, setNotifications] = React.useState<FriendInvite[]>([]);

  const friendInviteWs = React.useRef<WebSocket | null>(null);

  React.useEffect(() => {
    const ws = getWebsocketConnection('/friends/invites');
    if (!ws) return;

    friendInviteWs.current = ws;

    friendInviteWs.current.onopen = () => {
      console.log('opened');
    };

    friendInviteWs.current.addEventListener('message', ({ data }) => {
      const jsonData = JSON.parse(data);

      if (jsonData?.type === ALL_FRIEND_INVITES_TYPE) {
        const parsedData = allFriendsRequestSchema.safeParse(jsonData);
        console.log(parsedData);

        if (parsedData.success) {
          setNotifications(parsedData.data.payload);
        }
      }

      if (jsonData?.type === NEW_FRIEND_INVITE_TYPE) {
        const parsedData = newFriendRequestSchema.safeParse(jsonData);
        console.log(parsedData);

        if (parsedData.success) {
          setNotifications((notifications) => [
            ...notifications,
            parsedData.data.payload,
          ]);
        }
      }
    });

    friendInviteWs.current.onclose = () => {
      console.log('closed');
    };

    // return () => {
    //   friendInviteWs.current?.close();
    // };
  }, []);

  return (
    <div className='flex flex-col flex-grow items-center justify-center'>
      {user?.username}

      {notifications.map((notification) => (
        <div key={notification.inviterId}>
          {notification.inviterUsername} has invited you to be friends
        </div>
      ))}
    </div>
  );
}
