import { Play } from 'lucide-react';

import { useAuth } from '../../../app/providers/AuthProvider';

export function CatalogPage() {
  const { user, signOut } = useAuth();

  return (
    <main className="xf-app min-h-screen px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-xf-red">
            Xandeflix
          </p>

          <h1 className="text-3xl font-black md:text-5xl">Catálogo</h1>

          <p className="mt-2 text-sm text-xf-muted">
            Usuário conectado: {user?.email}
          </p>
        </div>

        <button
          className="tv-focusable rounded-lg bg-xf-surface px-5 py-3 font-bold text-white"
          onClick={() => void signOut()}
          data-nav-id="logout-button"
        >
          Sair
        </button>
      </header>

      <section className="hero-gradient mb-10 flex min-h-[360px] items-center rounded-2xl p-8">
        <div className="max-w-2xl">
          <p className="font-bold uppercase tracking-[0.3em] text-xf-red">
            Destaque
          </p>

          <h2 className="mt-4 text-5xl font-black md:text-7xl">
            Pronto para assistir
          </h2>

          <p className="mt-4 text-lg text-xf-muted">
            Base autenticada com Supabase. Próximo passo: catálogo real,
            playlists M3U/EPG e player universal.
          </p>

          <button
            className="tv-focusable mt-8 inline-flex items-center gap-3 rounded-lg bg-xf-red px-6 py-4 text-lg font-bold text-white"
            data-nav-id="catalog-play-button"
          >
            <Play size={24} />
            Assistir agora
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-2xl font-black">Continuar assistindo</h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <button
              key={index}
              className="media-card tv-focusable aspect-[2/3] text-left"
              data-nav-id={`media-card-${index + 1}`}
            >
              <span className="sr-only">Mídia {index + 1}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}