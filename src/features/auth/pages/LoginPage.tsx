import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Play } from 'lucide-react';

import { useAuth } from '../../../app/providers/AuthProvider';

export function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    try {
      await signIn(email, password);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao entrar.');
    }
  }

  return (
    <main className="xf-app flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-md rounded-2xl bg-xf-surface p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-xf-red">
            <Play size={24} fill="white" />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-xf-red">
              Xandeflix
            </p>
            <h1 className="text-3xl font-black">Entrar</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-xf-muted">
              E-mail
            </span>

            <input
              className="tv-focusable w-full rounded-lg bg-black px-4 py-4 text-white"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-xf-muted">
              Senha
            </span>

            <input
              className="tv-focusable w-full rounded-lg bg-black px-4 py-4 text-white"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {feedback && (
            <p className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-200">
              {feedback}
            </p>
          )}

          <button
            className="tv-focusable w-full rounded-lg bg-xf-red px-6 py-4 text-lg font-bold text-white disabled:opacity-60"
            type="submit"
            disabled={isLoading}
            data-nav-id="login-submit-button"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}