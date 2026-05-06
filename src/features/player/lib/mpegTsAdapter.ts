import { Capacitor } from '@capacitor/core';

import type {
  UniversalPlayerAdapter,
  UniversalPlayerSource,
  PlayerTelemetryEvent,
} from '../types/player';

type MpegTsPlayer = {
  attachMediaElement: (element: HTMLMediaElement) => void;
  load: () => void;
  unload?: () => void;
  pause?: () => void;
  destroy: () => void;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type MpegTsApi = {
  isSupported: () => boolean;
  createPlayer: (
    mediaDataSource: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => MpegTsPlayer;
  Events?: {
    ERROR?: string;
  };
};

type MpegTsAdapterOptions = {
  onTelemetryEvent?: (event: PlayerTelemetryEvent) => void;
};

function createMpegTsTelemetryEvent(
  name: string,
  level: PlayerTelemetryEvent['level'],
  message?: string,
  data?: Record<string, unknown>,
): PlayerTelemetryEvent {
  return {
    source: 'mpegts',
    name,
    level,
    message,
    data,
    timestamp: Date.now(),
  };
}

function waitForNativeReadiness(videoElement: HTMLVideoElement, timeoutMs: number) {
  if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let softResolveId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      videoElement.removeEventListener('loadedmetadata', handleReady);
      videoElement.removeEventListener('loadeddata', handleReady);
      videoElement.removeEventListener('canplay', handleReady);
      videoElement.removeEventListener('error', handleError);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (softResolveId) {
        clearTimeout(softResolveId);
      }
    };

    const handleReady = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(
        videoElement.error ?? new Error('Erro ao carregar stream MPEG-TS nativo.'),
      );
    };

    videoElement.addEventListener('loadedmetadata', handleReady, { once: true });
    videoElement.addEventListener('loadeddata', handleReady, { once: true });
    videoElement.addEventListener('canplay', handleReady, { once: true });
    videoElement.addEventListener('error', handleError, { once: true });

    // Streams ao vivo podem não emitir metadata antes do play.
    // Se não houver erro imediato, libera o botão Reproduzir e deixa o play
    // acionar a conexão real do decoder nativo.
    softResolveId = setTimeout(() => {
      cleanup();
      resolve();
    }, 1_500);

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Tempo limite ao preparar stream MPEG-TS nativo.'));
    }, timeoutMs);
  });
}

async function loadWithNativeVideoElement(
  videoElement: HTMLVideoElement,
  source: UniversalPlayerSource,
) {
  videoElement.pause();
  videoElement.removeAttribute('src');
  videoElement.load();

  videoElement.preload = 'auto';
  videoElement.crossOrigin = null;
  videoElement.src = source.url;
  videoElement.load();

  await waitForNativeReadiness(videoElement, 15_000);
}

function waitForMetadata(videoElement: HTMLVideoElement, timeoutMs: number) {
  if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    const handleLoadedMetadata = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(
        videoElement.error ?? new Error('Erro ao carregar stream MPEG-TS.'),
      );
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Tempo limite ao preparar stream MPEG-TS.'));
    }, timeoutMs);

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, {
      once: true,
    });
    videoElement.addEventListener('error', handleError, {
      once: true,
    });
  });
}

function resolveMpegTsApi(moduleValue: unknown): MpegTsApi | null {
  const candidate =
    moduleValue &&
    typeof moduleValue === 'object' &&
    'default' in moduleValue &&
    moduleValue.default
      ? moduleValue.default
      : moduleValue;

  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const api = candidate as Partial<MpegTsApi>;

  if (
    typeof api.isSupported !== 'function' ||
    typeof api.createPlayer !== 'function'
  ) {
    return null;
  }

  return api as MpegTsApi;
}

export function createMpegTsAdapter(
  videoElement: HTMLVideoElement,
  options: MpegTsAdapterOptions = {},
): UniversalPlayerAdapter {
  const pushTelemetry = (
    name: string,
    level: PlayerTelemetryEvent['level'],
    message?: string,
    data?: Record<string, unknown>,
  ) => {
    options.onTelemetryEvent?.(
      createMpegTsTelemetryEvent(name, level, message, data),
    );
  };
  let playerInstance: MpegTsPlayer | null = null;

  return {
    kind: 'mpegts',

    async load(source: UniversalPlayerSource) {
      if (!source.url.trim()) {
        throw new Error('URL MPEG-TS não informada.');
      }

      if (Capacitor.isNativePlatform()) {
        pushTelemetry(
          'MPEGTS_NATIVE_DIRECT_START',
          'info',
          'Tentando MPEG-TS direto pelo HTMLVideoElement nativo do Android.',
        );

        try {
          await loadWithNativeVideoElement(videoElement, source);
          pushTelemetry(
            'MPEGTS_NATIVE_DIRECT_READY',
            'info',
            'MPEG-TS nativo preparado para reprodução.',
          );
          return;
        } catch (nativeError) {
          pushTelemetry(
            'MPEGTS_NATIVE_DIRECT_FAILED',
            'warn',
            'Fallback nativo direto falhou; tentando mpegts.js.',
            {
              message:
                nativeError instanceof Error
                  ? nativeError.message
                  : String(nativeError),
            },
          );
        }
      }

      pushTelemetry(
        'MPEGTS_DYNAMIC_IMPORT_START',
        'info',
        'Importando mpegts.js sob demanda.',
      );

      const mpegTsModule = await import('mpegts.js');
      const mpegTsApi = resolveMpegTsApi(mpegTsModule);

      if (!mpegTsApi) {
        pushTelemetry(
          'MPEGTS_INVALID_LIBRARY',
          'error',
          'Biblioteca mpegts.js inválida neste ambiente.',
        );
        throw new Error('Biblioteca mpegts.js inválida neste ambiente.');
      }

      if (!mpegTsApi.isSupported()) {
        pushTelemetry(
          'MPEGTS_NOT_SUPPORTED',
          'error',
          'MPEG-TS/MSE não é suportado neste ambiente.',
        );
        throw new Error('MPEG-TS não é suportado neste ambiente.');
      }

      playerInstance?.destroy();
      playerInstance = null;

      videoElement.preload = 'metadata';

      const player = mpegTsApi.createPlayer(
        {
          type: 'mse',
          isLive: true,
          hasAudio: true,
          hasVideo: true,
          url: source.url,
        },
        {
          enableWorker: true,
          lazyLoad: false,
          autoCleanupSourceBuffer: true,
          stashInitialSize: 128,
          fixAudioTimestampGap: true,
        },
      );

      playerInstance = player;
      pushTelemetry(
        'MPEGTS_PLAYER_CREATED',
        'info',
        'Player mpegts.js criado.',
      );

      pushTelemetry(
        'MPEGTS_PLAYER_CREATED',
        'info',
        'Player mpegts.js criado.',
      );

      player.attachMediaElement(videoElement);

      pushTelemetry(
        'MPEGTS_MEDIA_ATTACHED',
        'info',
        'Elemento de vídeo anexado ao mpegts.js.',
      );

      pushTelemetry(
        'MPEGTS_MEDIA_ATTACHED',
        'info',
        'Elemento de vídeo anexado ao mpegts.js.',
      );

      await new Promise<void>((resolve, reject) => {
        let settled = false;

        const settleResolve = () => {
          if (settled) {
            return;
          }

          settled = true;
          resolve();
        };

        const settleReject = (error: Error) => {
          if (settled) {
            return;
          }

          settled = true;
          reject(error);
        };

        const errorEventName = mpegTsApi.Events?.ERROR;

        if (errorEventName && typeof player.on === 'function') {
          player.on(errorEventName, (...args: unknown[]) => {
            let reason = 'erro desconhecido';

            if (args.length > 0) {
              try {
                reason =
                  typeof args[0] === 'string'
                    ? args[0]
                    : JSON.stringify(args[0]);
              } catch {
                reason = String(args[0]);
              }
            }

            pushTelemetry(
              'MPEGTS_ERROR',
              'error',
              'Erro emitido pelo mpegts.js.',
              {
                reason,
              },
            );

            pushTelemetry(
              'MPEGTS_ERROR',
              'error',
              'Erro emitido pelo mpegts.js.',
              {
                reason,
              },
            );

            settleReject(new Error(`Falha no mpegts.js: ${reason}`));
          });
        }

        try {
          pushTelemetry(
            'MPEGTS_LOAD_CALLED',
            'info',
            'player.load() chamado no mpegts.js.',
          );

          pushTelemetry(
            'MPEGTS_LOAD_CALLED',
            'info',
            'player.load() chamado no mpegts.js.',
          );

          player.load();
        } catch (error) {
          settleReject(
            error instanceof Error
              ? error
              : new Error('Falha ao iniciar player MPEG-TS.'),
          );
          return;
        }

        waitForMetadata(videoElement, 25_000)
          .then(() => {
            pushTelemetry(
              'MPEGTS_METADATA_READY',
              'info',
              'Metadados MPEG-TS carregados.',
            );

            settleResolve();
          })
          .catch((error) => {
            settleReject(
              error instanceof Error
                ? error
                : new Error('Falha ao carregar metadados MPEG-TS.'),
            );
          });
      });
    },

    async play() {
      await videoElement.play();
    },

    async pause() {
      videoElement.pause();
      playerInstance?.pause?.();
    },

    destroy() {
      playerInstance?.pause?.();
      playerInstance?.unload?.();
      playerInstance?.destroy();
      playerInstance = null;

      videoElement.pause();
      videoElement.removeAttribute('src');
      videoElement.load();
    },
  };
}
