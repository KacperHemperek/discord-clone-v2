import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useRegister } from '../../hooks/useRegister';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

const registerFormSchema = z
  .object({
    username: z.string().min(3).max(32),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{10,32}$/,
        'password does not meet requirements'
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
    <div className='flex h-screen items-center justify-center text-gray-50 bg-dc-purple-500'>
      <form
        onSubmit={form.handleSubmit(handleUserRegister)}
        className='bg-dc-neutral-900 p-4 rounded-md flex flex-col max-w-lg w-full'
      >
        <h1 className='text-2xl font-semibold text-center pb-2'>
          Create an account
        </h1>
        <div className='flex flex-col pb-6'>
          <label
            htmlFor='email'
            className='uppercase text-xs font-bold text-dc-neutral-300 pb-3'
          >
            Username
          </label>
          <input
            {...form.register('username')}
            type='text'
            id='username'
            className='w-full p-2 rounded-sm bg-dc-neutral-950'
          />
          {form.formState.errors.username && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.username.message}
            </p>
          )}
        </div>
        <div className='flex flex-col pb-6'>
          <label
            htmlFor='email'
            className='uppercase text-xs font-bold text-dc-neutral-300 pb-3'
          >
            Password
          </label>
          <input
            {...form.register('password')}
            type='password'
            id='username'
            className='w-full p-2 rounded-sm bg-dc-neutral-950'
          />
          {form.formState.errors.password && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <div className='flex flex-col pb-6'>
          <label
            htmlFor='email'
            className='uppercase text-xs font-bold text-dc-neutral-300 pb-3'
          >
            Confirm Password
          </label>
          <input
            {...form.register('confirmPassword')}
            type='password'
            id='username'
            className='w-full p-2 rounded-sm bg-dc-neutral-950'
          />
          {form.formState.errors.confirmPassword && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
        <button
          className='bg-green rounded-sm bg-dc-purple-500 p-3 mb-4 font-semibold'
          type='submit'
        >
          Register
        </button>
        <ul className='pb-2 text-sm text-neutral-400'>
          <h2>Password must have:</h2>
          <li className='flex gap-2 items-center pl-1'>
            {' '}
            <span className='w-1 h-1 rounded-full bg-dc-green-300' />
            between 10 to 32 characters 1 special character
          </li>
          <li className='flex gap-2 items-center pl-1'>
            {' '}
            <span className='w-1 h-1 rounded-full bg-dc-green-300' />
            at least 1 uppercase letter
          </li>
          <li className='flex gap-2 items-center pl-1'>
            {' '}
            <span className='w-1 h-1 rounded-full bg-dc-green-300' />
            at least 1 number
          </li>
          <li className='flex gap-2 items-center pl-1'>
            {' '}
            <span className='w-1 h-1 rounded-full bg-dc-green-300' />
            at least 1 special character
          </li>
        </ul>
        <Link to='/login' className='text-sm text-sky-500'>
          Already have and account?
        </Link>
      </form>
    </div>
  );
}
