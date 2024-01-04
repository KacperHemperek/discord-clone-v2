import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSuccessResponseType } from '@shared/types/commonResponses';
import { cn } from '../../utils/cn';
import { Container } from '../../components/friends/FriendPageContainer';
import { api } from '../../utils/api';
import { ClientError } from '../../utils/clientError';

const InviteFormSchema = z.object({
  email: z.string().email('Enter a valid email address to invite user'),
});

type InviteFormValues = z.infer<typeof InviteFormSchema>;

export default function InviteUserPage() {
  const form = useForm<InviteFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(InviteFormSchema),
  });

  const [showSuccess, setShowSuccess] = React.useState(false);

  const { mutate: sendFriendRequestMutation } = useMutation({
    mutationKey: ['invite-friend'],
    mutationFn: async (data: InviteFormValues) =>
      await api.post<MessageSuccessResponseType>('/friends/invites', {
        body: JSON.stringify(data),
      }),
    onError: (err) => {
      if (err instanceof ClientError) {
        form.setError('email', {
          message: err.message,
        });
      } else {
        console.error(err);
        form.setError('email', {
          message: 'Something went wrong, please try again later',
        });
      }
      setShowSuccess(false);
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
    },
  });

  function sendFriendRequest(data: InviteFormValues) {
    sendFriendRequestMutation(data);
  }

  return (
    <Container className='pt-4 flex flex-col gap-2'>
      <h1 className='uppercase tracking-wide font-semibold'>Invite User</h1>
      <p className='text-sm text-dc-neutral-300'>
        You can invite users to join Discord by sending them invite with their
        email
      </p>
      <form
        className={cn(
          'flex bg-dc-neutral-1000 py-2 px-3 items-center rounded-md focus-within:ring-2 ring-sky-500',
          form.formState.errors.email && 'ring-dc-red-500',
          showSuccess && 'ring-dc-green-500'
        )}
        onSubmit={form.handleSubmit(sendFriendRequest)}
      >
        <input
          className='bg-transparent placeholder:text-dc-neutral-300 ring-0 flex-grow text-lg'
          type='text'
          placeholder='Enter users email address'
          {...form.register('email')}
        />
        <button
          className='px-3 py-1.5 text-sm rounded-sm bg-dc-purple-500 font-semibold'
          type='submit'
        >
          Send friend invite request
        </button>
      </form>
      {showSuccess && (
        <p className='text-sm text-dc-green-500'>
          Friend invite request sent successfully
        </p>
      )}
      {form.formState.errors.email && (
        <p className='text-sm text-dc-red-500'>
          {form.formState.errors.email.message}
        </p>
      )}
    </Container>
  );
}
