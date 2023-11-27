import { Link, createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    children: [
      {
        path: 'channels',
        element: (
          <div>
            <Link to='/'>To home</Link>
          </div>
        ),
        ErrorBoundary: () => <div>error</div>,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);
