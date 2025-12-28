import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectPastQuestion } from '@/lib/openai/detectPastQuestion';

const { openAiCreate } = vi.hoisted(() => ({
  openAiCreate: vi.fn(),
}));

const setWindow = (value: typeof window | undefined) => {
  Object.defineProperty(globalThis, 'window', { value, writable: true });
};

vi.mock('@/lib/openai/client', () => ({
  openai: {
    chat: {
      completions: {
        create: openAiCreate,
      },
    },
  },
}));

const originalWindow = globalThis.window;

beforeEach(() => {
  openAiCreate.mockReset();
});

afterEach(() => {
  setWindow(originalWindow);
});

describe('detectPastQuestion', () => {
  it('detects past tense via heuristic without calling OpenAI', async () => {
    setWindow(originalWindow);
    const result = await detectPastQuestion('¿Qué pasó ayer con la flota?');
    expect(result).toEqual({ isPast: true, source: 'fallback' });
    expect(openAiCreate).not.toHaveBeenCalled();
  });

  it('skips OpenAI in the browser when the heuristic does not detect past tense', async () => {
    setWindow(originalWindow);
    const result = await detectPastQuestion('Cuántos vehículos hay activos hoy');
    expect(result).toEqual({ isPast: false, source: 'fallback' });
    expect(openAiCreate).not.toHaveBeenCalled();
  });

  it('uses OpenAI on the server and marks PASADO correctly', async () => {
    setWindow(undefined);
    openAiCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'PASADO' } }],
    });
    const result = await detectPastQuestion('Quién modificó el vehículo 12');
    expect(openAiCreate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ isPast: true, source: 'openai' });
  });

  it('treats NO_PASADO even when the word PASADO is present', async () => {
    setWindow(undefined);
    openAiCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'NO_PASADO' } }],
    });
    const result = await detectPastQuestion('Quién es el conductor actual');
    expect(result).toEqual({ isPast: false, source: 'openai' });
  });

  it('returns fallback false when OpenAI fails', async () => {
    setWindow(undefined);
    openAiCreate.mockRejectedValueOnce(new Error('network'));
    const result = await detectPastQuestion('Cuál es el estado');
    expect(result).toEqual({ isPast: false, source: 'fallback' });
  });

  it('returns false for empty strings', async () => {
    setWindow(originalWindow);
    const result = await detectPastQuestion('   ');
    expect(result).toEqual({ isPast: false, source: 'fallback' });
    expect(openAiCreate).not.toHaveBeenCalled();
  });
});
