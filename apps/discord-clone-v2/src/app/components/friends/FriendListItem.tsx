import React from 'react';
import { MessageCircle, Trash } from 'lucide-react';
import FriendListItemButton from './FriendItemButton';
import RemoveFriendDialog from './RemoveFriendDialog';

export default function FriendListItem({
  id,
  username,
  avatar,
}: {
  id: string;
  username: string;
  avatar?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className='relative flex w-full group'>
      {/* Top Border */}
      <div className='top-0 left-0 right-0 absolute h-[1px] bg-dc-neutral-850' />
      <div className='flex justify-between items-center flex-grow py-3 px-3 -mx-3 rounded-md group-hover:bg-dc-neutral-850 transition-colors duration-100'>
        {/* User information */}
        <div className='flex flex-col'>
          <h2 className='font-semibold'>{username}</h2>
        </div>
        {/* Action Buttons */}
        <div className='flex gap-3'>
          <FriendListItemButton
            icon={<MessageCircle size={20} />}
            onClick={() => console.log('open chat window')}
          />
          <RemoveFriendDialog
            open={open}
            setOpen={setOpen}
            id={id}
            username={username}
            trigger={
              <FriendListItemButton
                icon={<Trash size={20} />}
                onClick={() => console.log('remove friend')}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
