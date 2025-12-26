import { Concept } from "@/types/concepts/api";
import type { PaginationMeta } from '@/hooks/usePaginatedIndex';

export type VehicleStatus = string;

export type VehicleConcept = Concept;

export interface Vehicle {
  id: number;
  plate: string;
  model_year: number | null;
  engine_number: string | null;
  chassis_number: string | null;
  color: string | null;
  seated_capacity: number | null;
  standing_capacity: number | null;
  property_card: string | null;
  status: VehicleStatus;

  brand: VehicleConcept | null;
  vehicle_class: VehicleConcept | null;
  body_type: VehicleConcept | null;
}

export interface VehiclesIndexResponse {
  data: Vehicle[];
  meta?: {
    pagination?: PaginationMeta;
    ai?: boolean;
    ai_explanation?: string | null;
    applied_filters?: Record<string, string>;
  };
}

/**
 * Source of truth for Vehicle readable attributes.
 * IMPORTANT: keep this in sync with the backend serializer.
 */
export const VEHICLE_READ_ATTRIBUTES: (keyof Vehicle)[] = [
  'id',
  'plate',
  'model_year',
  'engine_number',
  'chassis_number',
  'color',
  'seated_capacity',
  'standing_capacity',
  'property_card',
  'status',
  'brand',
  'vehicle_class',
  'body_type',
];

export type VehicleReadableAttribute = (typeof VEHICLE_READ_ATTRIBUTES)[number];
