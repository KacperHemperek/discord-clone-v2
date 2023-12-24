import React from 'react';
import { useLogin } from '../../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate: login } = useLogin({
    onSuccess: () => {
      navigate('/');
    },
    onError: (error) => {
      console.log(error);
      form.reset();
    },
  });

  const handleUserLogin = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className='h-screen flex items-center justify-center text-gray-50 bg-dc-purple-400'>
      <form
        onSubmit={form.handleSubmit(handleUserLogin)}
        className='bg-dc-neutral-900 p-4 rounded-md flex flex-col gap-6 max-w-sm w-full'
      >
        <h1 className='text-2xl font-bold'>Login</h1>
        <div className='flex flex-col'>
          <label htmlFor='email'>Username</label>
          <input
            {...form.register('username')}
            type='text'
            id='username'
            className='w-full p-2 rounded-md bg-gray-700'
          />
          {form.formState.errors.username && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.username.message}
            </p>
          )}
        </div>
        <div className='flex flex-col'>
          <label htmlFor='email'>Password</label>
          <input
            {...form.register('password')}
            type='password'
            id='password'
            className='w-full p-2 rounded-md bg-gray-700'
          />
          {form.formState.errors.password && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <button className='bg-green rounded-md bg-green-500 p-2' type='submit'>
          Login
        </button>
      </form>
    </div>
  );
}
