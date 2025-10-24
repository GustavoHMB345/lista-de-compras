// src/navigation/EventBus.js
// Minimal event bus for in-app communication (no external deps)
const listeners = new Map();

export function on(event, callback) {
  const set = listeners.get(event) || new Set();
  set.add(callback);
  listeners.set(event, set);
  return () => off(event, callback);
}

export function off(event, callback) {
  const set = listeners.get(event);
  if (!set) return;
  set.delete(callback);
  if (set.size === 0) listeners.delete(event);
}

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      // swallow
      console.warn(`[EventBus:${event}] handler error`, e);
    }
  });
}

export const EVENTS = {
  NAVIGATE_TAB: 'NAVIGATE_TAB', // payload: one of 'DASHBOARD' | 'FAMILY' | 'LISTS' | 'PROFILE'
  OPEN_ADD_LIST_MODAL: 'OPEN_ADD_LIST_MODAL',
};
