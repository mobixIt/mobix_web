export type FilterFieldSpec =
  | { type: 'string' }
  | { type: 'stringArray' }
  | { type: 'numberArray' }
  | { type: 'id' }
  | { type: 'asyncId' };

export type FilterQuerySpec = Record<string, FilterFieldSpec>;

const splitValues = (value: string) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const sanitizeNumberStrings = (values: string[]) =>
  values
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n))
    .map(String);

export function filtersToQueryString(
  filters: Record<string, unknown>,
  spec: FilterQuerySpec,
): string {
  const params = new URLSearchParams();

  Object.entries(spec).forEach(([key, field]) => {
    const value = filters[key];
    if (value == null) return;

    if (field.type === 'string') {
      const str = String(value).trim();
      if (str) params.set(key, str);
      return;
    }

    if (field.type === 'id') {
      const str = String(value).trim();
      if (str) params.set(key, str);
      return;
    }

    if (field.type === 'asyncId') {
      const id = typeof value === 'object' && value !== null ? (value as { value?: unknown }).value : value;
      const str = String(id ?? '').trim();
      if (str) params.set(key, str);
      return;
    }

    if (field.type === 'stringArray') {
      const base = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? splitValues(value)
          : [];
      const arr = base.map((v) => String(v).trim()).filter(Boolean);
      if (arr.length) params.set(key, arr.join(','));
      return;
    }

    if (field.type === 'numberArray') {
      const base = Array.isArray(value)
        ? value.map((v) => String(v))
        : typeof value === 'string'
          ? splitValues(value)
          : [];
      const arr = sanitizeNumberStrings(base);
      if (arr.length) params.set(key, arr.join(','));
    }
  });

  return params.toString();
}

export function filtersFromQueryString(
  search: string,
  spec: FilterQuerySpec,
): Record<string, unknown> {
  const params = new URLSearchParams(search);
  const result: Record<string, unknown> = {};

  Object.entries(spec).forEach(([key, field]) => {
    const raw = params.get(key);
    if (raw == null) return;

    if (field.type === 'string' || field.type === 'id') {
      const str = raw.trim();
      if (str) result[key] = str;
      return;
    }

    if (field.type === 'asyncId') {
      const str = raw.trim();
      if (str) {
        result[key] = { label: str, value: str, code: null };
      }
      return;
    }

    if (field.type === 'stringArray') {
      const values = splitValues(raw);
      if (values.length) result[key] = values;
      return;
    }

    if (field.type === 'numberArray') {
      const values = sanitizeNumberStrings(splitValues(raw));
      if (values.length) result[key] = values;
    }
  });

  return result;
}

export function replaceUrlQuery(nextQuery: string) {
  if (typeof window === 'undefined') return;
  const newUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
}
