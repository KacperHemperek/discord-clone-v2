import React from 'react';
import { useLogin } from '../../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const { mutate: login } = useLogin({
    onSuccess: () => {
      navigate('/');
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  console.log(import.meta.env.VITE_API_URL);

  const handleUserLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <div className='h-screen flex items-center justify-center text-gray-50 bg-brand'>
      <form
        onSubmit={handleUserLogin}
        className='bg-gray-800 p-4 rounded-xl flex flex-col gap-6 max-w-sm w-full'
      >
        <h1 className='text-2xl font-bold'>Login</h1>
        <div className='flex flex-col'>
          <label htmlFor='email'>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type='text'
            id='username'
            className='w-full p-2 rounded-md bg-gray-700'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor='email'>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            id='username'
            className='w-full p-2 rounded-md bg-gray-700'
          />
        </div>
        <button className='bg-green rounded-md bg-green-500 p-2' type='submit'>
          Login
        </button>
      </form>
    </div>
  );
}
