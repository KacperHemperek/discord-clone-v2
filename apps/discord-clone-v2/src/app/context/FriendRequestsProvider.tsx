import {
  ALL_FRIEND_INVITES_TYPE,
  NEW_FRIEND_INVITE_TYPE,
} from '@configs/friends';
import React from 'react';
import { getWebsocketConnection } from '../utils/websocket';
import { z } from 'zod';

const inviteItemSchema = z.object({
  inviterId: z.string(),
  inviterUsername: z.string(),
  inviterEmail: z.string(),
  seen: z.boolean(),
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

function useFriendRequestsValue() {
  const [requests, setRequests] = React.useState<FriendInvite[]>([]);

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

        if (parsedData.success) {
          setRequests(parsedData.data.payload);
        }
      }

      if (jsonData?.type === NEW_FRIEND_INVITE_TYPE) {
        const parsedData = newFriendRequestSchema.safeParse(jsonData);

        if (parsedData.success) {
          setRequests((notifications) => [
            ...notifications,
            parsedData.data.payload,
          ]);
        }
      }
    });

    friendInviteWs.current.onclose = () => {
      console.log('closed');
    };

    return () => {
      friendInviteWs.current?.close();
    };
  }, []);

  return {
    requests: requests,
  };
}

type FriendRequestContextType = ReturnType<typeof useFriendRequestsValue>;

const FriendRequestsContext =
  React.createContext<FriendRequestContextType | null>(null);

export function useFriendRequests() {
  const context = React.useContext(FriendRequestsContext);

  if (!context) {
    throw new Error(
      'useFriendRequests must be used within a FriendRequestsProvider'
    );
  }

  return context;
}

export default function FriendRequestsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useFriendRequestsValue();

  return (
    <FriendRequestsContext.Provider value={value}>
      {children}
    </FriendRequestsContext.Provider>
  );
}
