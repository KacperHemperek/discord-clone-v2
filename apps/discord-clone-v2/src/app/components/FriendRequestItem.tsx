import { Check, X } from 'lucide-react';
import React from 'react';

export default function FriendRequestItem({
  userId,
  username,
  avatar,
}: {
  username: string;
  avatar?: string;
  userId: string;
}) {
  return (
    <button className='relative flex w-full'>
      {/* Top Border */}
      <div className='top-0 left-0 right-0 absolute h-[1px] bg-dc-neutral-700' />
      <div className='flex justify-between items-center flex-grow py-3 px-4 -mx-4 rounded-lg hover:bg-dc-neutral-700 transition-colors duration-100'>
        {/* User information */}
        <div className='flex flex-col'>
          <h2 className='font-semibold'>{username}</h2>
        </div>
        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button className='p-1.5 rounded-full bg-dc-neutral-900'>
            <Check size={20} />
          </button>
          <button className='p-1.5 rounded-full bg-dc-neutral-900'>
            <X size={20} />
          </button>
        </div>
      </div>
    </button>
  );
}
