import { useLogin } from '../../hooks/useLogin';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../components/Input';

const LoginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate: login } = useLogin({
    onError: (error) => {
      console.log(error);
      form.reset();
      form.setError('username', {
        message: 'Invalid username or password',
      });
      form.setError('password', {
        message: 'Invalid username or password',
      });
    },
  });

  const handleUserLogin = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className='h-screen flex items-center justify-center text-gray-50 bg-neutral-800'>
      <form
        onSubmit={form.handleSubmit(handleUserLogin)}
        className='bg-dc-neutral-900 p-4 rounded-md flex flex-col max-w-lg w-full shadow-sm'
      >
        <div className='pb-2'>
          <h1 className='text-2xl font-semibold text-center'>Welcome Back</h1>
          <p className='text-dc-neutral-400 text-center'>
            We're so excited to see you again!
          </p>
        </div>
        <div className='pb-6'>
          <Controller
            control={form.control}
            name='username'
            render={({ field, formState: { errors } }) => (
              <Input
                label='username'
                type='text'
                error={errors.username?.message}
                {...field}
              />
            )}
          />
        </div>
        <div className='flex flex-col pb-6'>
          <Controller
            control={form.control}
            name='password'
            render={({ field, formState: { errors } }) => (
              <Input
                label='password'
                type='password'
                error={errors.password?.message}
                {...field}
              />
            )}
          />
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
