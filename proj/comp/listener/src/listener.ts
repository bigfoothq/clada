import type { ListenerConfig, ListenerHandle } from './types.js';

export async function startListener(config: ListenerConfig): Promise<ListenerHandle> {
  throw new Error('Not implemented');
}

export async function stopListener(handle: ListenerHandle): Promise<void> {
  throw new Error('Not implemented');
}