import { useEffect, type ReactNode } from 'react';
import { init } from '@noriginmedia/norigin-spatial-navigation';

interface SpatialNavigationProviderProps {
  children: ReactNode;
}

export function SpatialNavigationProvider({
  children,
}: SpatialNavigationProviderProps) {
  useEffect(() => {
    init({
      debug: false,
      visualDebug: false,
    });
  }, []);

  return children;
}