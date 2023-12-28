import React from 'react';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import FriendRequestItem from '../../components/FriendRequestItem';

export default function FriendRequests() {
  const { requests } = useFriendRequests();

  return (
    <>
      <h1 className='uppercase text-xs font-semibold tracking-[0.02em] text-dc-neutral-200 px-10 py-4'>
        Waiting - {requests.length}
      </h1>
      <div className='px-10 pb-4 overflow-auto'>
        {requests.map((request) => (
          <FriendRequestItem
            userId={request.inviterId}
            username={request.inviterUsername}
          />
        ))}
      </div>
    </>
  );
}
