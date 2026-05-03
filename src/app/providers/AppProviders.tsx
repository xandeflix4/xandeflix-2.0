import React from 'react'
import { AuthProvider } from './AuthProvider'
import { SpatialNavigationProvider } from './SpatialNavigationProvider'

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <SpatialNavigationProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SpatialNavigationProvider>
  )
}
