export type StreamKind = 'hls' | 'dash' | 'mpegts' | 'mp4' | 'unknown';

export type StreamDetectionResult = {
  kind: StreamKind;
  url: string;
  extension: string | null;
  mimeType?: string;
};
