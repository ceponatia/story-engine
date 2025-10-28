import type { TelemetryEvents } from '../types';

export const noopTelemetry: TelemetryEvents = {
  onPreflight: () => {},
  onCompletion: () => {},
  onError: () => {},
};
