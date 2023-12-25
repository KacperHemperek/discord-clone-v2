import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import BaseLayout from './layouts/BaseLayout';
import AuthGuard from './layouts/AuthGuard';
import FriendsPage from './pages/Friends';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: '/home',
        element: <BaseLayout />,
        children: [
          {
            path: '/home/friends',
            element: <FriendsPage />,
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
    ],
  },
]);
