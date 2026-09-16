import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { LandingPage } from './LandingPage';
import { ModuleHost } from './ModuleHost';
import { ErrorState } from '@components/ErrorState';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: ':track/:moduleId/*',
        element: <ModuleHost />,
      },
      {
        path: '*',
        element: (
          <div className="p-8 max-w-xl mx-auto">
            <ErrorState
              title="Page Not Found"
              detail="The requested path does not exist on this platform."
            />
          </div>
        ),
      },
    ],
  },
]);
