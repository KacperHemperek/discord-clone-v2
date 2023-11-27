import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../hooks/useLogout';
import { useQueryClient } from '@tanstack/react-query';
export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { mutate: logout } = useLogout({
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      navigate('/login');
    },
  });

  return (
    <div className='flex flex-col h-screen bg-brand items-center justify-center'>
      {user ? (
        <>
          {user.username}
          <button
            className='font-semibold bg-green-500 p-2 rounded-md text-slate-50'
            onClick={() => logout()}
          >
            Logout
          </button>
        </>
      ) : (
        <div className='flex flex-col gap-6 items-center'>
          <Link
            className='font-semibold bg-green-500 p-2 rounded-md text-slate-50'
            to='/login'
          >
            Login
          </Link>
          <Link
            className='font-semibold bg-green-500 p-2 rounded-md text-slate-50'
            to='/register'
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
