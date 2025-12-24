'use client';

import * as React from 'react';

type QaResponse = {
  answer: string;
};

type AskParams = {
  question: string;
};

export function useQuestionAnswering(sourceText: string) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [answer, setAnswer] = React.useState<string | null>(null);

  const ask = React.useCallback(
    async ({ question }: AskParams) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/ai/qa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, question }),
        });

        if (!res.ok) {
          const message = res.status === 503
            ? 'OpenAI no está configurado'
            : 'No se pudo obtener respuesta';
          throw new Error(message);
        }

        const data = (await res.json()) as QaResponse;
        setAnswer(data.answer);
        return data.answer;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [sourceText],
  );

  return { ask, loading, error, answer };
}

export type UseQuestionAnsweringReturn = ReturnType<typeof useQuestionAnswering>;
