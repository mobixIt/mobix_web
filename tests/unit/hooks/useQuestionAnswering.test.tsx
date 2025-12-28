import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionAnswering } from '@/hooks/useQuestionAnswering';

const fetchMock = vi.fn();

describe('useQuestionAnswering', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna la respuesta al completar exitosamente', async () => {
    const response = new Response(JSON.stringify({ answer: 'sí' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    fetchMock.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useQuestionAnswering('Texto de prueba'));

    let answer: string | null = null;
    await act(async () => {
      answer = await result.current.ask({ question: '¿Pregunta?' });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai/qa',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(answer).toBe('sí');
    expect(result.current.answer).toBe('sí');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('establece error cuando el servicio devuelve 503', async () => {
    const response = new Response('{}', { status: 503 });
    fetchMock.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useQuestionAnswering('Texto de prueba'));

    let answer: string | null = 'placeholder';
    await act(async () => {
      answer = await result.current.ask({ question: '¿Pregunta?' });
    });

    expect(answer).toBeNull();
    expect(result.current.answer).toBeNull();
    expect(result.current.error).toBe('OpenAI no está configurado');
    expect(result.current.loading).toBe(false);
  });

  it('maneja excepciones de red dejando loading en false', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useQuestionAnswering('Texto de prueba'));

    let answer: string | null = 'placeholder';
    await act(async () => {
      answer = await result.current.ask({ question: '¿Pregunta?' });
    });

    expect(answer).toBeNull();
    expect(result.current.answer).toBeNull();
    expect(result.current.error).toBe('network down');
    expect(result.current.loading).toBe(false);
  });
});
