export type Versioned<T> = T & { updated_at?: string };

// Last-write-wins using updated_at timestamps
export function lastWriteWins<T extends Versioned<Record<string, any>>>(local: T, remote: T): T {
  const lt = new Date(local.updated_at || 0).getTime();
  const rt = new Date(remote.updated_at || 0).getTime();
  return rt >= lt ? remote : local;
}

// For price updates, always append snapshot. Caller persists snapshot separately.
export function snapshotWins() {
  return true; // flag used by mutation handlers
}
