import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FriendListItem({
  id,
  username,
  avatar,
}: {
  id: string;
  username: string;
  avatar?: string;
}) {
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
            onClick={() => console.log('accept friend request')}
            className='p-1.5 rounded-full bg-dc-neutral-900'
          >
            <MessageCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
