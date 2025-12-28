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
  it('detecta pasado por heurística sin llamar a OpenAI', async () => {
    setWindow(originalWindow);
    const result = await detectPastQuestion('¿Qué pasó ayer con la flota?');
    expect(result).toEqual({ isPast: true, source: 'fallback' });
    expect(openAiCreate).not.toHaveBeenCalled();
  });

  it('omite OpenAI en entorno browser cuando la heurística no detecta pasado', async () => {
    setWindow(originalWindow);
    const result = await detectPastQuestion('Cuántos vehículos hay activos hoy');
    expect(result).toEqual({ isPast: false, source: 'fallback' });
    expect(openAiCreate).not.toHaveBeenCalled();
  });

  it('usa OpenAI en entorno server y marca PASADO correctamente', async () => {
    setWindow(undefined);
    openAiCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'PASADO' } }],
    });
    const result = await detectPastQuestion('Quién modificó el vehículo 12');
    expect(openAiCreate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ isPast: true, source: 'openai' });
  });

  it('considera NO_PASADO aunque contenga la palabra PASADO', async () => {
    setWindow(undefined);
    openAiCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'NO_PASADO' } }],
    });
    const result = await detectPastQuestion('Quién es el conductor actual');
    expect(result).toEqual({ isPast: false, source: 'openai' });
  });

  it('devuelve fallback false cuando OpenAI falla', async () => {
    setWindow(undefined);
    openAiCreate.mockRejectedValueOnce(new Error('network'));
    const result = await detectPastQuestion('Cuál es el estado');
    expect(result).toEqual({ isPast: false, source: 'fallback' });
  });

  it('retorna false en cadenas vacías', async () => {
    setWindow(originalWindow);
    const result = await detectPastQuestion('   ');
    expect(result).toEqual({ isPast: false, source: 'fallback' });
    expect(openAiCreate).not.toHaveBeenCalled();
  });
});
