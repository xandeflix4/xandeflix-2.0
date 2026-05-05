import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FocusableButton } from '@/components/tv/FocusableButton';
import {
  PlaylistRuntimeProvider,
  usePlaylistRuntime,
} from '../providers/PlaylistRuntimeProvider';
import type { IptvChannel } from '../types/playlist';

const MAX_VISIBLE_CHANNELS = 50;

function DirectSourcePlaylistContent() {
  const navigate = useNavigate();
  const {
    channels,
    diagnostics,
    status,
    error,
    loadFromSource,
    selectChannel,
    clearRuntime,
  } = usePlaylistRuntime();

  const [sourceUrl, setSourceUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return channels.slice(0, MAX_VISIBLE_CHANNELS);
    }

    return channels
      .filter((channel) =>
        [channel.name, channel.groupTitle, channel.tvgName]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch)),
      )
      .slice(0, MAX_VISIBLE_CHANNELS);
  }, [channels, searchTerm]);

  const handleLoad = useCallback(() => {
    void loadFromSource({
      url: sourceUrl,
      name: 'Lista IPTV direta',
    });
  }, [loadFromSource, sourceUrl]);

  const handleOpenChannel = useCallback(
    (channel: IptvChannel) => {
      selectChannel(channel);

      const params = new URLSearchParams({
        src: channel.url,
        title: channel.name,
      });

      navigate(`/player?${params.toString()}`);
    },
    [navigate, selectChannel],
  );

  return (
    <main className="xf-app min-h-screen bg-black px-8 py-8 text-white">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-zinc-950 p-8">
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-xf-red">
          Xandeflix Direct Source IPTV
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Lista IPTV direta da fonte
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-xf-muted">
          O app carrega a lista informada pelo usuário em tempo de execução,
          mantém os canais em memória e envia apenas a URL final do canal para
          o Player Universal.
        </p>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-6">
          <label className="block text-sm font-bold uppercase text-xf-muted">
            URL da lista IPTV
          </label>

          <input
            className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-xf-red"
            placeholder="Cole aqui a URL M3U/M3U Plus..."
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
          />

          <div className="mt-6 flex flex-wrap gap-4">
            <FocusableButton
              focusKey="direct-source-load-button"
              className="rounded-xl bg-xf-red px-6 py-4 text-lg font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status === 'loading'}
              onEnterPress={handleLoad}
              onClick={handleLoad}
            >
              {status === 'loading' ? 'Carregando...' : 'Carregar direto'}
            </FocusableButton>

            <FocusableButton
              focusKey="direct-source-clear-button"
              className="rounded-xl bg-white/10 px-6 py-4 text-lg font-black text-white"
              onEnterPress={clearRuntime}
              onClick={clearRuntime}
            >
              Limpar memória
            </FocusableButton>

            <FocusableButton
              focusKey="direct-source-player-button"
              className="rounded-xl bg-white px-6 py-4 text-lg font-black text-black"
              onEnterPress={() => navigate('/player')}
              onClick={() => navigate('/player')}
            >
              Ir ao Player
            </FocusableButton>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-6">
          <p className="text-sm font-bold uppercase text-xf-muted">
            Runtime
          </p>

          <div className="mt-4 grid gap-3 text-base">
            <p>
              Status:{' '}
              <strong className="text-white">{status}</strong>
            </p>

            <p>
              Canais em memória:{' '}
              <strong className="text-white">{channels.length}</strong>
            </p>

            {error ? (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-100">
                <p className="font-black">Aviso</p>
                <p className="mt-2">{error}</p>
              </div>
            ) : null}

            {diagnostics ? (
              <dl className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                <div>
                  <dt className="text-xf-muted">Começa com #EXTM3U</dt>
                  <dd className="font-bold text-white">
                    {diagnostics.startsWithExtM3u ? 'sim' : 'não'}
                  </dd>
                </div>

                <div className="mt-2">
                  <dt className="text-xf-muted">Linhas #EXTINF</dt>
                  <dd className="font-bold text-white">
                    {diagnostics.extinfLines}
                  </dd>
                </div>

                <div className="mt-2">
                  <dt className="text-xf-muted">URLs reproduzíveis</dt>
                  <dd className="font-bold text-white">
                    {diagnostics.playableUrlLines}
                  </dd>
                </div>

                <div className="mt-2">
                  <dt className="text-xf-muted">Primeira linha</dt>
                  <dd className="break-all font-mono text-xs text-white">
                    {diagnostics.firstNonEmptyLine || 'vazia'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-6">
          <label className="block text-sm font-bold uppercase text-xf-muted">
            Filtrar canais
          </label>

          <input
            className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-xf-red"
            placeholder="Digite parte do nome do canal..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <div className="mt-6 grid gap-3">
            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel, index) => (
                <FocusableButton
                  key={`${channel.id}-${channel.url}`}
                  focusKey={`direct-source-channel-${index}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-white hover:bg-white/10"
                  focusScrollTarget="closest-section"
                  onEnterPress={() => handleOpenChannel(channel)}
                  onClick={() => handleOpenChannel(channel)}
                >
                  <span className="block text-lg font-black">
                    {channel.name}
                  </span>

                  <span className="mt-1 block text-sm text-xf-muted">
                    {channel.groupTitle || 'Sem grupo'} · abrir no player
                  </span>
                </FocusableButton>
              ))
            ) : (
              <p className="text-xf-muted">
                Nenhum canal carregado em memória.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DirectSourcePlaylistPage() {
  return (
    <PlaylistRuntimeProvider>
      <DirectSourcePlaylistContent />
    </PlaylistRuntimeProvider>
  );
}
