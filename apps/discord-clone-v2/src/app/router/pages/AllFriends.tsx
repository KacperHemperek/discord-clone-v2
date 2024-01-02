import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { GetAllFriendsResponseBodyType } from '@shared-types/friends';
import { api } from '../../utils/api';

export default function AllFriendsPage() {
  const { data } = useQuery({
    queryKey: ['all-friends'],
    queryFn: async () => {
      const res = await api(`/friends/`);

      const resultObj = await res.json();

      if (!res.ok) {
        throw new Error(resultObj.message);
      }

      return resultObj as GetAllFriendsResponseBodyType;
    },
  });

  return (
    <div>
      {data?.friends.map((friend) => {
        return <div key={friend.id}>{friend.username}</div>;
      })}
    </div>
  );
}
