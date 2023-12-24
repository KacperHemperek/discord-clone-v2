import { useLogin } from '../../hooks/useLogin';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className='h-screen flex items-center justify-center text-gray-50 bg-dc-purple-500'>
      <form
        onSubmit={form.handleSubmit(handleUserLogin)}
        className='bg-dc-neutral-900 p-4 rounded-md flex flex-col max-w-lg w-full'
      >
        <div className='pb-2'>
          <h1 className='text-2xl font-semibold text-center'>Welcome Back</h1>
          <p className='text-dc-neutral-400 text-center'>
            We're so excited to see you again!
          </p>
        </div>
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
            id='password'
            className='w-full p-2 rounded-sm bg-dc-neutral-950'
          />
          {form.formState.errors.password && (
            <p className='text-xs text-rose-500 pt-1'>
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <button
          className='bg-green rounded-sm bg-dc-purple-500 p-3 mb-2 font-semibold'
          type='submit'
        >
          Login
        </button>

        <p className='text-sm text-dc-neutral-400'>
          Need an account?{' '}
          <Link to='/register' className='text-sky-500'>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
