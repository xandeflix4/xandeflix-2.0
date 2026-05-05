import type { StreamDetectionResult, StreamKind } from './stream';

export type PlayerStatus =
  | 'idle'
  | 'detecting'
  | 'ready'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'error'
  | 'unsupported';

export type PlayerErrorCode =
  | 'MISSING_STREAM_URL'
  | 'UNSUPPORTED_STREAM_KIND'
  | 'ADAPTER_NOT_IMPLEMENTED'
  | 'PLAYBACK_ERROR';

export type PlayerError = {
  code: PlayerErrorCode;
  message: string;
  details?: unknown;
};

export type UniversalPlayerSource = {
  url: string;
  mimeType?: string;
  title?: string;
};

export type UniversalPlayerAdapter = {
  kind: StreamKind;
  load: (source: UniversalPlayerSource) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  destroy: () => void;
};

export type PlayerPreparationResult =
  | {
      ok: true;
      stream: StreamDetectionResult;
    }
  | {
      ok: false;
      stream?: StreamDetectionResult;
      error: PlayerError;
    };
