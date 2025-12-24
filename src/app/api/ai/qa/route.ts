import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai/client';

type QaRequest = {
  text?: string;
  question?: string;
};

export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI client is not configured' },
      { status: 503 },
    );
  }

  const body = (await request.json()) as QaRequest;

  if (!body.text || !body.question) {
    return NextResponse.json(
      { error: 'text and question are required' },
      { status: 400 },
    );
  }

  const prompt = [
    {
      role: 'system',
      content:
        'Eres un asistente que responde preguntas sobre un texto dado. Responde de forma breve, en español, y si la pregunta hace referencia al pasado, acláralo en la respuesta. Devuelve solo la respuesta directa.',
    },
    {
      role: 'user',
      content: `Texto:\n${body.text}\n\nPregunta: ${body.question}`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: prompt,
      temperature: 0.2,
      max_tokens: 120,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ?? 'No se encontró respuesta';

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 },
    );
  }
}
