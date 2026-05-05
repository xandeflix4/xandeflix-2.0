import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadDirectSourcePlaylist } from '../lib/directSourcePlaylistLoader';
import type {
  IptvChannel,
  PlaylistDiagnostics,
  PlaylistRuntimeStatus,
  PlaylistSource,
} from '../types/playlist';

type PlaylistRuntimeContextValue = {
  source: PlaylistSource | null;
  channels: IptvChannel[];
  selectedChannel: IptvChannel | null;
  diagnostics: PlaylistDiagnostics | null;
  status: PlaylistRuntimeStatus;
  error: string | null;
  loadFromSource: (source: PlaylistSource) => Promise<void>;
  selectChannel: (channel: IptvChannel) => void;
  clearRuntime: () => void;
};

const PlaylistRuntimeContext =
  createContext<PlaylistRuntimeContextValue | null>(null);

export function PlaylistRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [source, setSource] = useState<PlaylistSource | null>(null);
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [selectedChannel, setSelectedChannel] =
    useState<IptvChannel | null>(null);
  const [diagnostics, setDiagnostics] =
    useState<PlaylistDiagnostics | null>(null);
  const [status, setStatus] =
    useState<PlaylistRuntimeStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadFromSource = useCallback(async (nextSource: PlaylistSource) => {
    setStatus('loading');
    setError(null);
    setSource(nextSource);
    setChannels([]);
    setSelectedChannel(null);
    setDiagnostics(null);

    try {
      const playlist = await loadDirectSourcePlaylist(nextSource);

      setChannels(playlist.channels);
      setDiagnostics(playlist.diagnostics);
      setStatus(playlist.total > 0 ? 'ready' : 'empty');

      if (playlist.total === 0) {
        setError(
          'A fonte foi carregada, mas nenhum canal válido foi encontrado.',
        );
      }
    } catch (loadError) {
      setStatus('error');
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Erro desconhecido ao carregar playlist.',
      );
    }
  }, []);

  const selectChannel = useCallback((channel: IptvChannel) => {
    setSelectedChannel(channel);
  }, []);

  const clearRuntime = useCallback(() => {
    setSource(null);
    setChannels([]);
    setSelectedChannel(null);
    setDiagnostics(null);
    setStatus('idle');
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      source,
      channels,
      selectedChannel,
      diagnostics,
      status,
      error,
      loadFromSource,
      selectChannel,
      clearRuntime,
    }),
    [
      source,
      channels,
      selectedChannel,
      diagnostics,
      status,
      error,
      loadFromSource,
      selectChannel,
      clearRuntime,
    ],
  );

  return (
    <PlaylistRuntimeContext.Provider value={value}>
      {children}
    </PlaylistRuntimeContext.Provider>
  );
}

export function usePlaylistRuntime() {
  const context = useContext(PlaylistRuntimeContext);

  if (!context) {
    throw new Error(
      'usePlaylistRuntime deve ser usado dentro de PlaylistRuntimeProvider.',
    );
  }

  return context;
}
