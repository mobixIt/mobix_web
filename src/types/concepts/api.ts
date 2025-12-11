export interface ConceptScopeEntry {
  key: string;
  mode: 'allow' | 'deny';
}

export interface Concept {
  id: number;
  code: string;
  label: string;
  name: string;
  parent_id: number | null;
  level: number;
  labels: Record<string, string>;
  meta: Record<string, unknown>;
  valid_from: string | null;
  valid_to: string | null;
  sort_order: number;
  active: boolean;
  concept_type_id: number;
  concept_type_key: string | null;
  concept_type_name: string | null;
  scopes: ConceptScopeEntry[];
}