import React from 'react';
import { Check, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../utils/api';
import { useFriendRequests } from '../context/FriendRequestsProvider';

export default function FriendRequestItem({
  id,
  userId,
  username,
  avatar,
}: {
  id: string;
  username: string;
  avatar?: string;
  userId: string;
}) {
  const { removeRequest } = useFriendRequests();

  const { mutate: acceptMutation } = useMutation({
    mutationKey: ['friend-request-accept', id],
    mutationFn: async () => {
      const res = await api(`/friends/invites/${id}/accept`, {
        method: 'PUT',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error(data?.message);
        throw new Error(data?.message);
      }

      return data;
    },

    onSuccess: () => {
      removeRequest(id);
    },
  });

  const { mutate: declineMutation } = useMutation({
    mutationKey: ['friend-request-decline', id],
    mutationFn: async () => {
      const res = await api(`/friends/invites/${id}/decline`, {
        method: 'PUT',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error(data?.message);
        throw new Error(data?.message);
      }

      return data;
    },
    onSuccess: () => {
      removeRequest(id);
    },
  });

  function acceptFriendRequest() {
    acceptMutation();
  }

  function declineFriendRequest() {
    declineMutation();
  }

  return (
    <div className='relative flex w-full group'>
      {/* Top Border */}
      <div className='top-0 left-0 right-0 absolute h-[1px] bg-dc-neutral-700' />
      <div className='flex justify-between items-center flex-grow py-3 px-2 -mx-2 rounded-md group-hover:bg-dc-neutral-700 transition-colors duration-100'>
        {/* User information */}
        <div className='flex flex-col'>
          <h2 className='font-semibold'>{username}</h2>
        </div>
        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={acceptFriendRequest}
            className='p-1.5 rounded-full bg-dc-neutral-900 hover:text-dc-green-600'
          >
            <Check size={20} />
          </button>
          <button
            onClick={declineFriendRequest}
            className='p-1.5 rounded-full bg-dc-neutral-900 hover:text-dc-red-500'
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
