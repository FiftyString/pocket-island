import { afterEach, expect, it, vi } from 'vitest';
import { defaults, SaveManager } from './save';
afterEach(() => vi.unstubAllGlobals());
it('storage blocked: read falls back and write reports failure without crashing', () => {
  vi.stubGlobal('localStorage', { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); } });
  expect(SaveManager.read()).toEqual(defaults());
  expect(SaveManager.write(defaults())).toBe(false);
});
it('storage round trip preserves options and record', () => {
  const values = new Map<string,string>();
  vi.stubGlobal('localStorage', { getItem: (k:string) => values.get(k) ?? null, setItem: (k:string,v:string) => values.set(k,v) });
  const save = { ...defaults(), muted: true, reduced: true, best: 100 };
  expect(SaveManager.write(save)).toBe(true);
  expect(SaveManager.read()).toEqual(save);
});
