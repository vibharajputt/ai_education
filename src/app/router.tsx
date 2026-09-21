// src/app/router.tsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { AuthPage } from './AuthPage';
import { AppShell } from './AppShell';
import { LandingPage } from './LandingPage';
import { ModuleHost } from './ModuleHost';
import { ErrorState } from '@components/ErrorState';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/signup',
    element: <AuthPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: '/:track/:moduleId/*',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <ModuleHost />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg)]">
        <div className="max-w-md w-full">
          <ErrorState
            title="Page Not Found"
            detail="The requested path does not exist on this platform."
          />
        </div>
      </div>
    ),
  },
]);
