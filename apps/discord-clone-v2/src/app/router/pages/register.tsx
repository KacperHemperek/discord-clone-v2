import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useRegister } from '../../hooks/useRegister';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const registerFormSchema = z
  .object({
    username: z.string().min(3).max(32),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{10,32}$/,
        'Password must have between 10 to 32 characters contain at least 1 uppercase letter, 1 number, and 1 special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormSchema = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
  });
  const { mutate: register } = useRegister({
    onError: (error) => {
      console.error(error.message);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      navigate('/');
    },
  });

  function handleUserRegister(data: RegisterFormSchema) {
    register(data);
  }

  return (
    <div className='flex h-screen items-center justify-center text-gray-50 bg-brand'>
      <form
        onSubmit={form.handleSubmit(handleUserRegister)}
        className='bg-gray-800 p-4 rounded-xl flex flex-col gap-6 max-w-sm w-full'
      >
        <h1 className='text-2xl font-bold'>Register</h1>
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
            id='username'
            className='w-full p-2 rounded-md bg-gray-700'
          />
          {form.formState.errors.password && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <div className='flex flex-col'>
          <label htmlFor='email'>Password</label>
          <input
            {...form.register('confirmPassword')}
            type='password'
            id='username'
            className='w-full p-2 rounded-md bg-gray-700'
          />
          {form.formState.errors.confirmPassword && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.confirmPassword.message}
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
