import type { ReactNode } from 'react';

import { AuthProvider } from './AuthProvider';
import { SpatialNavigationProvider } from './SpatialNavigationProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SpatialNavigationProvider>
      <AuthProvider>{children}</AuthProvider>
    </SpatialNavigationProvider>
  );
}