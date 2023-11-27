import React from 'react';
import '../styles.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function App() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4444/api/auth/me', {
        credentials: 'include',
      });
      const data = await response.json();
      return data.user;
    },
  });

  const { mutate: loginMutation } = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      try {
        const response = await fetch('http://localhost:4444/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        });

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (data) => {
      console.log(data);

      queryClient.setQueryData(['test'], data.user);
    },
  });

  const login = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation({ username, password });
  };

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div className='text-slate-50 bg-brand min-h-screen flex'>
      {isLoading && 'Loading...'}
      {!isLoading && user ? (
        JSON.stringify(user)
      ) : (
        <form
          onSubmit={login}
          className='flex flex-col gap-6 self-center mx-auto p-4 rounded-md bg-slate-800 max-w-sm w-full'
        >
          <h1 className='text-2xl'>Login</h1>
          <div className='flex flex-col w-full'>
            <label htmlFor='username'>Username</label>
            <input
              className='p-2 rounded-md text-black'
              type='username'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label htmlFor='password'>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='p-2 rounded-md text-black'
              type='password'
              id='password'
            />
          </div>
          <button type='submit'>
            <span>Login</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
