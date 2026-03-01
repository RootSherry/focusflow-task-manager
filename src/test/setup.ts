import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  const storage = window.localStorage;
  if (storage && typeof storage.clear === 'function') {
    storage.clear();
  }
});
