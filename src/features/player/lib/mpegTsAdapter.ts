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

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function summarizeUnknown(value: unknown) {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function summarizeMpegTsArgs(args: unknown[]) {
  if (args.length === 0) {
    return 'erro desconhecido';
  }

  return args.map(summarizeUnknown).join(' | ');
}

function isNumericStreamId(value: string) {
  return /^\d+$/.test(value);
}

function buildMpegTsCandidateUrls(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();
  const [urlWithoutHeaders, ...headerParts] = trimmedUrl.split('|');
  const headerSuffix = headerParts.length > 0 ? `|${headerParts.join('|')}` : '';

  const candidates = [trimmedUrl];

  try {
    const parsedUrl = new URL(urlWithoutHeaders);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);

    if (segments.length >= 3) {
      const streamId = segments[segments.length - 1] ?? '';
      const password = segments[segments.length - 2] ?? '';
      const username = segments[segments.length - 3] ?? '';
      const firstSegment = segments[0]?.toLowerCase();

      const isKnownTypedPath =
        firstSegment === 'live' ||
        firstSegment === 'movie' ||
        firstSegment === 'series' ||
        firstSegment === 'vod';

      if (!isKnownTypedPath && isNumericStreamId(streamId)) {
        candidates.push(
          `${parsedUrl.origin}/live/${username}/${password}/${streamId}.ts${headerSuffix}`,
          `${parsedUrl.origin}/live/${username}/${password}/${streamId}${headerSuffix}`,
          `${parsedUrl.origin}/${username}/${password}/${streamId}.ts${headerSuffix}`,
        );
      }
    }
  } catch {
    // Mantém apenas a URL original se ela não puder ser analisada com URL().
  }

  return uniqueValues(candidates);
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

      if (timeoutId) clearTimeout(timeoutId);
      if (softResolveId) clearTimeout(softResolveId);
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

      if (timeoutId) clearTimeout(timeoutId);
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

  const destroyCurrentPlayer = () => {
    playerInstance?.pause?.();
    playerInstance?.unload?.();
    playerInstance?.destroy();
    playerInstance = null;
  };

  return {
    kind: 'mpegts',

    async load(source: UniversalPlayerSource) {
      if (!source.url.trim()) {
        throw new Error('URL MPEG-TS não informada.');
      }

      const candidateUrls = buildMpegTsCandidateUrls(source.url);

      pushTelemetry(
        'MPEGTS_CANDIDATES_READY',
        'info',
        `Preparando ${candidateUrls.length} candidato(s) de URL MPEG-TS.`,
        {
          candidates: candidateUrls,
        },
      );

      if (Capacitor.isNativePlatform()) {
        for (const [index, candidateUrl] of candidateUrls.entries()) {
          pushTelemetry(
            'MPEGTS_NATIVE_DIRECT_START',
            'info',
            `Tentando MPEG-TS nativo Android. Candidato ${index + 1}/${candidateUrls.length}.`,
            {
              url: candidateUrl,
            },
          );

          try {
            await loadWithNativeVideoElement(videoElement, {
              ...source,
              url: candidateUrl,
            });

            pushTelemetry(
              'MPEGTS_NATIVE_DIRECT_READY',
              'info',
              `MPEG-TS nativo preparado. Candidato ${index + 1}/${candidateUrls.length}.`,
              {
                url: candidateUrl,
              },
            );
            return;
          } catch (nativeError) {
            pushTelemetry(
              'MPEGTS_NATIVE_DIRECT_FAILED',
              'warn',
              `Fallback nativo direto falhou no candidato ${index + 1}/${candidateUrls.length}.`,
              {
                url: candidateUrl,
                message: summarizeUnknown(nativeError),
              },
            );
          }
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

      let lastError: Error | null = null;

      for (const [index, candidateUrl] of candidateUrls.entries()) {
        destroyCurrentPlayer();

        videoElement.preload = 'metadata';

        const player = mpegTsApi.createPlayer(
          {
            type: 'mse',
            isLive: true,
            hasAudio: true,
            hasVideo: true,
            url: candidateUrl,
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
          `Player mpegts.js criado. Candidato ${index + 1}/${candidateUrls.length}.`,
          {
            url: candidateUrl,
          },
        );

        player.attachMediaElement(videoElement);

        pushTelemetry(
          'MPEGTS_MEDIA_ATTACHED',
          'info',
          'Elemento de vídeo anexado ao mpegts.js.',
        );

        try {
          await new Promise<void>((resolve, reject) => {
            let settled = false;

            const settleResolve = () => {
              if (settled) return;
              settled = true;
              resolve();
            };

            const settleReject = (error: Error) => {
              if (settled) return;
              settled = true;
              reject(error);
            };

            const errorEventName = mpegTsApi.Events?.ERROR;

            if (errorEventName && typeof player.on === 'function') {
              player.on(errorEventName, (...args: unknown[]) => {
                const reason = summarizeMpegTsArgs(args);

                pushTelemetry(
                  'MPEGTS_ERROR',
                  'error',
                  `Erro emitido pelo mpegts.js: ${reason}`,
                  {
                    url: candidateUrl,
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
                `player.load() chamado no mpegts.js. Candidato ${index + 1}/${candidateUrls.length}.`,
                {
                  url: candidateUrl,
                },
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
                  {
                    url: candidateUrl,
                  },
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

          return;
        } catch (error) {
          lastError =
            error instanceof Error
              ? error
              : new Error('Falha desconhecida no mpegts.js.');

          pushTelemetry(
            'MPEGTS_CANDIDATE_FAILED',
            'warn',
            `Candidato MPEG-TS falhou: ${lastError.message}`,
            {
              url: candidateUrl,
            },
          );
        }
      }

      destroyCurrentPlayer();

      throw lastError ?? new Error('Falha ao carregar stream MPEG-TS.');
    },

    async play() {
      await videoElement.play();
    },

    async pause() {
      videoElement.pause();
      playerInstance?.pause?.();
    },

    destroy() {
      destroyCurrentPlayer();

      videoElement.pause();
      videoElement.removeAttribute('src');
      videoElement.load();
    },
  };
}
