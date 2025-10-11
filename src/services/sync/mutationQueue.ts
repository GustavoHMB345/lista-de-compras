import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export type MutationType =
  | 'LIST_ADD'
  | 'LIST_UPDATE'
  | 'ITEM_ADD'
  | 'ITEM_UPDATE'
  | 'ITEM_TOGGLE'
  | 'SNAPSHOT_ADD';

export interface Mutation {
  id: string; // idempotency key
  type: MutationType;
  payload: any;
  createdAt: string;
  retries: number;
  dedupeKey?: string; // for collapsing consecutive updates
}

export type Handler = (m: Mutation) => Promise<'ok' | 'conflict' | 'retry'>;

const STORAGE_KEY = '@SuperLista:mutations';
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

const handlers: Partial<Record<MutationType, Handler>> = {};

export function registerHandler(type: MutationType, handler: Handler) {
  handlers[type] = handler;
}

export async function enqueue(m: Omit<Mutation, 'createdAt' | 'retries'>) {
  const list = await loadAll();
  const next: Mutation = { ...m, createdAt: new Date().toISOString(), retries: 0 };
  const collapsed = collapse(list, next);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
}

export async function loadAll(): Promise<Mutation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Mutation[]) : [];
  } catch {
    return [];
  }
}

function collapse(list: Mutation[], next: Mutation) {
  // Snapshot ops are append-only; never collapse
  if (next.type === 'SNAPSHOT_ADD') return [...list, next];
  if (!next.dedupeKey) return [...list, next];
  // Replace the last operation with same dedupeKey and type
  const idx = [...list]
    .reverse()
    .findIndex((m) => m.dedupeKey === next.dedupeKey && m.type === next.type);
  if (idx === -1) return [...list, next];
  const pos = list.length - 1 - idx;
  const updated = [...list];
  updated[pos] = next; // keep only latest
  return updated;
}

export async function processAll(): Promise<void> {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return; // offline: skip
  let list = await loadAll();
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    const res = await processOne(m);
    if (res === 'ok') {
      list.splice(i, 1);
      i -= 1;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } else if (res === 'conflict') {
      // Fetch latest remote and resolve or discard based on policy
      // For now, drop and let UI refetch; production: merge with lastWriteWins
      list.splice(i, 1);
      i -= 1;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } else {
      // retry with backoff
      if (m.retries + 1 >= MAX_RETRIES) {
        list.splice(i, 1);
        i -= 1;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } else {
        m.retries += 1;
        await delay(BASE_DELAY * Math.pow(2, m.retries));
      }
    }
  }
}

async function processOne(m: Mutation): Promise<'ok' | 'conflict' | 'retry'> {
  const handler = handlers[m.type];
  if (!handler) return 'ok'; // nothing to do
  try {
    return await handler(m);
  } catch {
    return 'retry';
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
