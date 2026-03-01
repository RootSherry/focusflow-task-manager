export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export function getBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

export function safeReadJSON<T>(storage: StorageLike | null, key: string): T | null {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeWriteJSON(storage: StorageLike | null, key: string, value: unknown): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(storage: StorageLike | null, key: string): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
