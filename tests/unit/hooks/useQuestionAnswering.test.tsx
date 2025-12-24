import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionAnswering } from '@/hooks/useQuestionAnswering';

describe('useQuestionAnswering', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the QA API and returns the answer', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: 'sí' }),
    } as Response);

    const { result } = renderHook(() => useQuestionAnswering('Texto de prueba'));

    let response: string | null = null;
    await act(async () => {
      response = await result.current.ask({ question: '¿Pregunta?' });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai/qa',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(response).toBe('sí');
    expect(result.current.answer).toBe('sí');
    expect(result.current.error).toBeNull();
  });

  it('sets an error when the API fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useQuestionAnswering('Texto de prueba'));

    let response: string | null = null;
    await act(async () => {
      response = await result.current.ask({ question: '¿Pregunta?' });
    });

    expect(response).toBeNull();
    expect(result.current.answer).toBeNull();
    expect(result.current.error).toBe('OpenAI no está configurado');
  });
});
