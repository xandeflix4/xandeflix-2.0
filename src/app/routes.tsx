import {
  lazy,
  Suspense,
  type ReactNode,
} from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './providers/AuthProvider';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';

const UniversalPlayerPage = lazy(
  () => import('../features/player/pages/UniversalPlayerPage'),
);

const TestPlaylistPage = lazy(
  () => import('../features/player/pages/TestPlaylistPage'),
);

const DirectSourcePlaylistPage = lazy(
  () => import('../features/playlists/pages/DirectSourcePlaylistPage'),
);

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="xf-app flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-xf-muted">Carregando...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RouteLoader() {
  return (
    <main className="xf-app flex min-h-screen items-center justify-center">
      <p className="text-xl font-semibold text-xf-muted">Carregando rota...</p>
    </main>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CatalogPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <UniversalPlayerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/player/test-playlist"
            element={
              <ProtectedRoute>
                <TestPlaylistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/playlists/direct-source"
            element={
              <ProtectedRoute>
                <DirectSourcePlaylistPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
