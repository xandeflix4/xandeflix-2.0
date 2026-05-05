import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FocusableButton } from '@/components/tv/FocusableButton';
import { detectStreamKind } from '../lib/detectStreamKind';

export default function UniversalPlayerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const streamUrl = searchParams.get('src') ?? '';

  const streamInfo = useMemo(() => {
    if (!streamUrl) return null;

    return detectStreamKind(streamUrl);
  }, [streamUrl]);

  return (
    <main className="xf-app min-h-screen bg-black px-8 py-8 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950 p-8">
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-xf-red">
            Xandeflix Player
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Player Universal
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-xf-muted">
            Estrutura inicial carregada por rota lazy. Nenhuma biblioteca pesada
            de vídeo deve ser importada no boot do catálogo.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-6">
            <p className="text-sm font-bold uppercase text-xf-muted">
              Stream detectado
            </p>

            {streamInfo ? (
              <dl className="mt-4 grid gap-3 text-base">
                <div>
                  <dt className="text-xf-muted">Tipo</dt>
                  <dd className="font-bold text-white">{streamInfo.kind}</dd>
                </div>

                <div>
                  <dt className="text-xf-muted">Extensão</dt>
                  <dd className="font-bold text-white">
                    {streamInfo.extension ?? 'não identificada'}
                  </dd>
                </div>

                <div>
                  <dt className="text-xf-muted">URL</dt>
                  <dd className="break-all font-mono text-sm text-white/80">
                    {streamInfo.url}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-xf-muted">
                Nenhum stream informado. Use a rota com parâmetro:
                <span className="ml-2 font-mono text-white">
                  /player?src=URL_DO_STREAM
                </span>
              </p>
            )}
          </div>
        </section>

        <nav className="mt-8 flex gap-4">
          <FocusableButton
            focusKey="player-back-button"
            className="rounded-xl bg-white px-6 py-4 text-lg font-black text-black"
            onEnterPress={() => navigate('/')}
          >
            Voltar ao catálogo
          </FocusableButton>

          <FocusableButton
            focusKey="player-play-button"
            className="rounded-xl bg-xf-red px-6 py-4 text-lg font-black text-white"
            onEnterPress={() => undefined}
          >
            Preparar reprodução
          </FocusableButton>
        </nav>
      </div>
    </main>
  );
}
