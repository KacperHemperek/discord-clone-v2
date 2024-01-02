import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import BaseLayout from './layouts/BaseLayout';
import AuthGuard from './layouts/AuthGuard';
import FriendsPage from './pages/Friends';
import FriendsLayout from './layouts/FriendsLayout';
import FriendRequestsPage from './pages/FriendRequests';
import AllFriendsPage from './pages/AllFriends';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: 'home',
        element: <BaseLayout />,
        children: [
          {
            path: 'friends',
            element: <FriendsLayout />,
            children: [
              {
                path: '',
                element: <FriendsPage />,
              },
              {
                path: 'requests',
                element: <FriendRequestsPage />,
              },
              {
                path: 'all',
                element: <AllFriendsPage />,
              },
              {
                path: 'invite',
                element: <div>invite</div>,
              },
            ],
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
]);
