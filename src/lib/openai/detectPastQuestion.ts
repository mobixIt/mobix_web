import { openai } from './client';

const quickHeuristicDetectPast = (question: string): boolean => {
  const q = question.toLowerCase().trim();

  const timeKeywords = [
    'ayer', 'anteayer', 'anoche', 'pasado', 'pasada', 'anterior', 'previo', 'previa', 'antiguo', 'antigua', 'histórico',
    'historico', 'último', 'ultima', 'hace', 'ya',
  ];
  if (new RegExp(`\\b(${timeKeywords.join('|')})\\b`, 'i').test(q)) return true;

  const irregularVerbs = [
    'fui', 'fuiste', 'fue', 'fuimos', 'fueron', 'era', 'eras', 'eran', 'éramos', 'estuve', 'estuviste', 'estuvo', 'estuvimos',
    'estuvieron', 'estaba', 'estabas', 'estaban', 'hube', 'hubo', 'hubieron', 'había', 'habían', 'hice', 'hiciste', 'hizo',
    'hicimos', 'hicieron', 'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron', 'dijo', 'dijeron', 'trajo', 'trajeron',
  ];
  if (new RegExp(`\\b(${irregularVerbs.join('|')})\\b`, 'i').test(q)) return true;

  const domainVerbs = [
    'registró', 'registro', 'creó', 'creo', 'agregó', 'agrego', 'modificó', 'modifico', 'actualizó', 'actualizo', 'eliminó', 'elimino',
    'guardó', 'guardo', 'activó', 'desactivó', 'desactivo', 'cambió', 'cambio', 'asignó', 'asigno', 'visualizó', 'visualizo', 'exportó',
    'exporto', 'buscó', 'busco', 'filtró',
  ];
  const safeDomain = domainVerbs.filter((v) => v !== 'registro' && v !== 'filtró');
  if (new RegExp(`\\b(${safeDomain.join('|')})\\b`, 'i').test(q)) return true;

  if (/\b\w+(?:aron|ieron|uieron)\b/i.test(q)) return true;
  if (/\b\w+(?:aba|abas|aban)\b/i.test(q)) return true;
  if (/\b(?!(?:d|t|polic|gu|energ|tecnolog|categor|bater|aver|tuber)ía)\w+ía(?:n|s)?\b/i.test(q)) return true;
  if (/\b\w+(?:aste|iste)\b/i.test(q)) return true;
  if (/(?<!ci|si|xi|ti|ni)ó\b/i.test(q)) return true;
  if (/\b(ha|han|hemos|había|habían)\s+\w+(?:ado|ido)\b/i.test(q)) return true;

  const monthKeywords = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'setiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const hasMonth = new RegExp(`\\b(${monthKeywords.join('|')})\\b`, 'i').test(q);
  const hasParticiple = /\b\w+(?:ado|ada|ados|adas|ido|ida|idos|idas)\b/i.test(q);
  if (hasMonth && hasParticiple) return true;

  return false;
};

type DetectPastResult = {
  isPast: boolean;
  source: 'openai' | 'fallback';
};

export async function detectPastQuestion(question: string): Promise<DetectPastResult> {
  const trimmed = question.trim();
  if (!trimmed) return { isPast: false, source: 'fallback' };

  const heuristicMatch = quickHeuristicDetectPast(trimmed);
  if (heuristicMatch) {
    // TODO: enviar a DataDog esta pregunta marcada como pasado por heurística.
    return { isPast: true, source: 'fallback' };
  }

  if (typeof window !== 'undefined') {
    return { isPast: false, source: 'fallback' };
  }

  if (!openai) {
    return { isPast: false, source: 'fallback' };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 5,
      messages: [
        {
          role: 'system',
          content: `Eres un experto en lingüística para consultas de bases de datos.
          Analiza si la intención del usuario se refiere a un evento histórico, un registro de auditoría o un estado anterior.
          Reglas:
          - "Quién modificó..." -> PASADO
          - "Cuál era el estado..." -> PASADO
          - "Quién es el conductor..." -> NO_PASADO
          - "Cuántos vehículos hay..." -> NO_PASADO
          Responde estrictamente con "PASADO" o "NO_PASADO".`,
        },
        {
          role: 'user',
          content: trimmed,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const upper = raw.toUpperCase();
    const isPast = upper.includes('PASADO') && !upper.includes('NO_PASADO');
    return { isPast, source: 'openai' };
  } catch {
    return { isPast: false, source: 'fallback' };
  }
}

export default detectPastQuestion;
