import React from 'react';

type FriendListItemButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
};

const FriendListItemButton = React.forwardRef<
  HTMLButtonElement,
  FriendListItemButtonProps
>(({ icon, onClick }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className='p-2 rounded-full bg-dc-neutral-950 group'
    >
      {icon}
    </button>
  );
});

export default FriendListItemButton;
