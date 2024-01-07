import React from 'react';
import { MessageCircle, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateChatWithUsersSuccessResponseType,
  GetChatsSuccessResponseType,
} from '@shared/types/chats';
import { ChatTypes } from '@shared/configs/chats';
import FriendListItemButton from './FriendItemButton';
import RemoveFriendDialog from './RemoveFriendDialog';
import { api } from '../../utils/api';
import { ClientError } from '../../utils/clientError';
import { useToast } from '../../hooks/useToast';

export default function FriendListItem({
  id,
  username,
  avatar,
}: {
  id: string;
  username: string;
  avatar?: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await api.post<CreateChatWithUsersSuccessResponseType>(
        '/chats',
        {
          body: JSON.stringify({
            userIds: [id],
          }),
        }
      );

      return data;
    },
    onError: (error: ClientError) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      const { chatId } = data;
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Chat created successfully!');
      navigate(`/home/chats/${chatId}`);
    },
  });

  function createOrRedirectToChat() {
    const data = queryClient.getQueryData(['chats']) as
      | GetChatsSuccessResponseType
      | undefined;

    if (!data) return;

    const chat = data.chats.find((chat) => {
      return (
        chat.type === ChatTypes.private &&
        chat.users.some((user) => user.id === id)
      );
    });

    if (chat) {
      navigate(`/home/chats/${chat.id}}`);
      return;
    }
    mutate();
  }

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
            disabled={isPending}
            icon={<MessageCircle size={20} />}
            onClick={createOrRedirectToChat}
          />
          <RemoveFriendDialog
            open={open}
            setOpen={setOpen}
            id={id}
            username={username}
            trigger={
              <FriendListItemButton
                disabled={isPending}
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
