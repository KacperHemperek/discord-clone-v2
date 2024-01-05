import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog';
import DCButton from '../Button';

export default function RemoveFriendDialog({
  id,
  username,
  trigger,
  open,
  onOpenChange,
}: {
  id: string;
  username: string;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 bg-black/50' />
        <DialogContent className='flex flex-col max-w-md w-full fixed top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 bg-dc-neutral-800 rounded-md overflow-hidden'>
          <DialogTitle className='p-3 text-xl font-medium text-dc-neutral-50'>
            Remove Friend '{username}'
          </DialogTitle>
          <DialogDescription className='px-3 pb-3 text-dc-neutral-200'>
            Are you sure that you want to remove{' '}
            <span className='font-medium'>{username}</span> from your friends
          </DialogDescription>

          <footer className='p-3 bg-dc-neutral-850 flex justify-end gap-2'>
            <DCButton
              variant='link'
              size='lg'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </DCButton>
            <DCButton variant='danger' size='lg'>
              Remove Friend
            </DCButton>
          </footer>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
