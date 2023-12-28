import React from 'react';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import FriendRequestItem from '../../components/FriendRequestItem';

export default function FriendRequests() {
  const { requests } = useFriendRequests();

  return (
    <div className='overflow-y-auto'>
      <div className='flex flex-col py-4 px-10 gap-4'>
        <h1 className='uppercase text-xs font-semibold tracking-[0.02em] text-dc-neutral-200'>
          Waiting - {requests.length}
        </h1>
        <div>
          {requests.map((request) => (
            <FriendRequestItem
              userId={request.inviterId}
              username={request.inviterUsername}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
