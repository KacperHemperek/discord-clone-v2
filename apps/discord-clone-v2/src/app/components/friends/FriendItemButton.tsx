import React from 'react';

export default function FriendListItemButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className='p-2 rounded-full bg-dc-neutral-900 group'
    >
      {icon}
    </button>
  );
}
